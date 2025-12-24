const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");



// generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------- SIGNUP ----------------
exports.signup = async (req, res) => {

    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    console.log("Generated OTP:", otp);
    user = await User.create({
      name,
      email,
      password: hashed,
      otp,
      otpExpire: Date.now() + 5 * 60 * 1000, // 5 mins
    });

    try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP Code:</h2><h1>${otp}</h1>`
    });
} catch (mailErr) {
  console.log("MAIL ERROR:", mailErr);
  return res.status(500).json({ message: "Failed to send OTP email" });
}

    res.json({ success: true, message: "OTP sent to email", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- VERIFY EMAIL ----------------
exports.verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpire < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- RESEND OTP ----------------
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();
    console.log("Generated OTP:", otp);

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP Code:</h2><h1>${otp}</h1>`
    });

    res.json({ success: true, message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ---------------- LOGIN (Email + Password + Verification Check) ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Email not verified" ,userId: user._id,email: user.email});

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
