const express = require("express");
const { signup, verifyEmail, resendOtp, login } = require("../controllers/authController");
const sendMail = require("../utils/sendMail");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);

router.post("/test-mail", async (req, res) => {
  const { email } = req.body;

  try {
    await sendMail({
  to: email,
  subject: "Your OTP Code",
  html: `<h2>Your OTP Code:</h2><h1>12345</h1><p>Valid for 5 minutes</p>`,
});

    res.json({ success: true, message: "Mail sent" });
  } catch (e) {
    console.log("MAIL ERROR:", e.message);
    res.status(500).json({ message: "Mail failed" });
  }
});

module.exports = router;
