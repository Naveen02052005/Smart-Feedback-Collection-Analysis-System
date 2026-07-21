const express = require("express");
const router = express.Router();
const feedback = require("../controllers/feedbackController");
const {isAdminLogged, isLoggedIn} = require("../Middlewares/isLoggedIn")

router.get("/feedback", feedback.getFeedback);
router.post("/feedback", feedback.postFeedback);
router.get("/history", feedback.getHistory);

module.exports = router;
