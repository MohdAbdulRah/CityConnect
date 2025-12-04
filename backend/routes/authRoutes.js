const express = require("express");
const { signup, verifyEmail, resendOtp,login } = require("../controllers/authController");
const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);

module.exports = router;
