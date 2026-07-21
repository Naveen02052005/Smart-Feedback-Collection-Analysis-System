const { v4: uuidv4 } = require("uuid");
const connection = require("../db/connection");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

exports.getFeedback = (req, res) => {
  res.render("feedback.ejs",{activePage:"feedback",user:res[0]});
};

function cleanText(text) {
    return text.replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

exports.postFeedback = (req, res) => {
  const { message, typeofCategory, categoryName, rating } = req.body;
  const cleanedMessage = cleanText(message);
  const result = sentiment.analyze(cleanedMessage);
  const textScore = result.score ;
  const feedbackId = uuidv4();
  const userId = req.session.userId || null;

  let ratingScore;

  switch(Number(rating))
  {
    case 5:
      ratingScore = 2;
      break;
    case 4:
      ratingScore = 1;
      break;
    case 3:
      ratingScore = 0;
      break;
    case 2:
      ratingScore = -1;
      break;
    case 1:
      ratingScore= -2;
      break;
  }

  const finalScore = textScore * 0.7 + ratingScore * 0.3;

  let sentimentLabel;
  
  if(finalScore > 0)
  {
    sentimentLabel = "Positive"
  }
  else if(finalScore < 0)
  {
    sentimentLabel = "Negative"
  }
  else
  {
    sentimentLabel = "Neutral"
  }
  const q1 = "INSERT INTO feedback(feedbackId,userId,message,sentiment,rating) VALUES (?,?,?,?,?)";
  connection.query(q1, [feedbackId, userId, message, sentimentLabel, rating], (err) => {
    if (err) throw err;

    const q2 = "INSERT INTO servicetype(feedbackId,typeofCategory,categoryName) VALUES(?,?,?)";
    connection.query(q2, [feedbackId, typeofCategory, categoryName], (err2) => {
      if (err2) throw err2;
      res.render("success.ejs", { sentimentLabel, typeofCategory, categoryName, userId, rating });
    });
  });
};

exports.getHistory = (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const q = `
    SELECT f.message, f.sentiment, f.timestamp, f.rating, s.typeofCategory, s.categoryName, u.userName
    FROM feedback f
    LEFT JOIN serviceType s ON f.feedbackId = s.feedbackId
    JOIN UserDetails u ON f.userId = u.id
    WHERE f.userId = ? ORDER BY f.timestamp DESC
  `;
  connection.query(q, [req.session.userId], (err, results) => {
    if (err) throw err;
    res.render("history.ejs", { results,activePage:"history" });
  });
};
