const connection = require("../db/connection");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const transporter = require("../config/mailer");


exports.getHome = (req,res) => {
  res.render("home");
}
exports.getRegister = (req, res) => {
  res.render("registration.ejs", { nameError: null, emailError: null });
};

exports.getOTP = (req, res) => {
    res.render("otpVerify", {
        error: null,
        formAction: "/verify-otp",
        resendAction: "/resend-otp"
    });
};

exports.verifyOtp = (req, res) => {

    const { otp } = req.body;

    const userData = req.session.userData;

    if (!userData) {
        return res.redirect("/registration");
    }

    if (otp !== userData.otp) {
        return res.render("otpVerify", {
          error: "Invalid OTP",
          formAction: "/verify-otp",
          resendAction: "/resend-otp"
      });
    }

    if (new Date() > userData.otpExpiry) {
        return res.render("otpVerify", {
          error: "OTP Expired",
          formAction: "/verify-otp",
          resendAction: "/resend-otp"
      });
    }


    const insertQuery =
    `INSERT INTO UserDetails 
    (id, userName, email, password, isVerified)
    VALUES (?, ?, ?, ?, true)`;


    connection.query(
        insertQuery,
        [
            userData.id,
            userData.userName,
            userData.email,
            userData.password
        ],
        (err) => {

            if (err) throw err;

            delete req.session.userData;
            delete req.session.email;

            res.redirect("/login");
        }
    );
};
exports.resendOtp = async (req, res) => {

    const email = req.session.email;

    if (!req.session.userData) {
        return res.redirect("/registration");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    try {

         await transporter.emails.send({
        from: "Smart Feedback System <onboarding@resend.dev>",
        to: email,
        subject: "Email Verification OTP",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    console.log("Mail sent successfully");

        
        req.session.userData.otp = otp; 
        req.session.userData.otpExpiry = expiry;

       res.render("otpVerify", {
          error: "New OTP sent successfully.",
          formAction: "/verify-otp",
          resendAction: "/resend-otp"
      });

    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to send OTP");
    }
};

exports.postRegister = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.render("registration.ejs", {
        nameError: "Please fill all fields properly.",
        emailError: null,
      });
    }

    function generateOTP() {
      return Math.floor(100000 + Math.random() * 900000).toString();
  }

    const otp = generateOTP();

    const expiry = new Date(Date.now() + 5 * 60 * 1000); 

   

   


    const checkUserQuery = "SELECT * FROM UserDetails WHERE userName = ?";
    connection.query(checkUserQuery, [userName], (err, userResults) => {
      if (err) throw err;

      if (userResults.length > 0) {
        return res.render("registration.ejs", {
          nameError: "Username already exists. Try another one.",
          emailError: null,
        });
      }

      const checkEmailQuery = "SELECT * FROM UserDetails WHERE email = ?";
      connection.query(checkEmailQuery, [email], async (err2, emailResults) => {
        if (err2) throw err2;

        if (emailResults.length > 0) {
          return res.render("registration.ejs", {
            nameError: null,
            emailError: "Email already exists. Try another one.",
          });
        }
        try {

        await transporter.emails.send({
            from: "Smart Feedback System <onboarding@resend.dev>",
            to: email,
            subject: "Email Verification OTP",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`
        });

        } catch(error) {

            console.log("Resend Error:", error);
            return res.status(500).send("OTP sending failed");

        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();

        req.session.userData = {
          id,
          userName,
          email,
          password: hashedPassword,
          otp,
          otpExpiry: expiry
      };

      req.session.email = email;

      req.session.save((err) => {
          if (err) {
              console.log(err);
              return res.status(500).send("Session error");
          }

          res.redirect("/verify-otp");
      });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

exports.getLogin = (req, res) => {
  res.render("login.ejs", { error: null });
};

exports.postLogin = (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide userName and password" });
  }

  const q = "SELECT * FROM UserDetails WHERE userName = ? OR email = ?";
  connection.query(q, [userName, userName], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.render("login.ejs", { error: "User not found" });
    }

    const user = results[0];

    if (!user.isVerified) {
    return res.render("login.ejs", {
        error: "Please verify your email first."
    });
}

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login.ejs", { error: "Invalid password" });
    }

    req.session.userId = user.id;
    req.session.userName = user.userName;
    console.log("Login successful");
    res.redirect("/feedback");
  });
};


exports.getForgotPassword = (req, res) => {
    res.render("forgotPassword", { error: null });
};

exports.postForgotPassword = (req, res) => {

    const { email } = req.body;

    const query = "SELECT * FROM UserDetails WHERE email=?";

    connection.query(query, [email], async (err, result) => {

        if (err) throw err;

        if (result.length === 0) {
            return res.render("forgotPassword", {
                error: "Email not registered."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        connection.query(
            "UPDATE UserDetails SET otp=?, otpExpiry=? WHERE email=?",
            [otp, expiry, email],
            async (err2) => {

                if (err2) throw err2;

               try {
                 await transporter.emails.send({
                from: "Smart Feedback System <onboarding@resend.dev>",
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP is ${otp}. It expires in 5 minutes.`
            });


              } catch (err) {
                  console.log("Mail Error:", err);
                  return res.status(500).send("OTP mail failed");
              }

                req.session.resetEmail = email;

                res.redirect("/forgot-otp");
            }
        );

    });

};


exports.getForgotOtp = (req, res) => {

    if (!req.session.resetEmail) {
        return res.redirect("/forgot-password");
    }

    res.render("otpVerify", {
        error: null,
        formAction: "/forgot-otp",
        resendAction: "/forgot-resend-otp"
    });

};

exports.verifyForgotOtp = (req, res) => {

    const { otp } = req.body;

    const email = req.session.resetEmail;

    const query =
        "SELECT * FROM UserDetails WHERE email=? AND otp=?";

    connection.query(query, [email, otp], (err, result) => {

        if (err) throw err;

        if (result.length === 0) {
          return res.render("otpVerify", {
              error: "Invalid OTP",
              formAction: "/forgot-otp",
              resendAction: "/forgot-resend-otp"
          });
      }

        const user = result[0];

        if (new Date() > user.otpExpiry) {

            return res.render("otpVerify", {
              error: "OTP Expired",
              formAction: "/forgot-otp",
              resendAction: "/forgot-resend-otp"
          });

        }

        res.redirect("/reset-password");

    });

};

exports.resendForgotOtp = async (req, res) => {

    const email = req.session.resetEmail;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    connection.query(
        "UPDATE UserDetails SET otp=?, otpExpiry=? WHERE email=?",
        [otp, expiry, email],
        async (err) => {

            if (err) throw err;

            try {
    await transporter.emails.send({
        from: "Smart Feedback System <onboarding@resend.dev>",
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

        res.render("otpVerify", {
            error: "New OTP sent successfully.",
            formAction: "/forgot-otp",
            resendAction: "/forgot-resend-otp"
        });

    } catch(error) {
        console.log(error);
        res.status(500).send("OTP sending failed");
    }


        });

};

exports.getResetPassword = (req, res) => {

    if (!req.session.resetEmail) {
        return res.redirect("/forgot-password");
    }

    res.render("resetPassword", {
        error: null
    });

};
exports.postResetPassword = async (req, res) => {

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {

        return res.render("resetPassword", {
            error: "Passwords do not match."
        });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const email = req.session.resetEmail;

    const query =
        `UPDATE UserDetails
         SET password=?,
             otp=NULL,
             otpExpiry=NULL
         WHERE email=?`;

    connection.query(
        query,
        [hashedPassword, email],
        (err) => {

            if (err) throw err;

            delete req.session.resetEmail;

            res.redirect("/login");

        });

};
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/home");
  });
};
