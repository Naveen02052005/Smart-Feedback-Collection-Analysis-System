const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

router.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test",
      text: "Hello",
    });

    res.send("Mail sent");
  } catch (err) {
    console.error(err);
    res.send(err.message);
  }
});

router.get("/", (req, res) => {
    res.redirect("/home");
});
router.get("/home",auth.getHome);
router.get("/verify-otp",auth.getOTP)
router.post("/verify-otp", auth.verifyOtp);
router.post("/resend-otp", auth.resendOtp);
router.get("/registration", auth.getRegister);
router.post("/register", auth.postRegister);
router.get("/login", auth.getLogin);
router.post("/login", auth.postLogin);
router.get("/forgot-password", auth.getForgotPassword);
router.post("/forgot-password", auth.postForgotPassword);

router.get("/forgot-otp", auth.getForgotOtp);
router.post("/forgot-otp", auth.verifyForgotOtp);
router.post("/forgot-resend-otp", auth.resendForgotOtp);

router.get("/reset-password", auth.getResetPassword);
router.post("/reset-password", auth.postResetPassword);
router.get("/logout", auth.logout);

module.exports = router;
