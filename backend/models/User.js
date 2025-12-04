const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: String,
  otpExpire: Date,
  given : { type: Number, default: 0 },
  received : { type: Number, default: 0 },
  rating : { type: Number, default: 0.0 },
   location: String,
  isVerified: { type: Boolean, default: false },
},{timestamps : true});

module.exports = mongoose.model("User", userSchema);
