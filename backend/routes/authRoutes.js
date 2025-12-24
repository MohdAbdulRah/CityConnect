const express = require("express");
const { signup, verifyEmail, resendOtp,login } = require("../controllers/authController");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.BREVO_API_KEY,
  },
});

router.post("/test-mail", async (req, res) => {
  const {email} = req.body
  try {
    await transporter.sendMail({
  from: `"CityConnect" <${process.env.MAIL_USER}>`,
  to: email,
  subject: "Your OTP Code",
  html: `<h2>Your OTP Code:</h2><h1>12345</h1>`,
});
    res.send("Mail sent");
  } catch (e) {
    res.status(500).send(e.message);
  }
});


module.exports = router;
