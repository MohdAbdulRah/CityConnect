// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    otp: String,
    profileImage: String,
    otpExpire: Date,
    phone: String,
    allowCall: { type: Boolean, default: false },
     // Location
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: More precise location (for maps later)
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    // NEW: List of items this user has GIVEN
    given: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stuff",
      },
    ],
    givenTasks : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    // NEW: List of items this user has RECEIVED
    received: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stuff",
      },
    ],
    receivedTasks : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    posts : [
       {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Post"
       }
    ],
    rating: { type: Number, default: 0.0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ given: 1 });
userSchema.index({ received: 1 });
userSchema.index({ coordinates: "2dsphere" });


module.exports = mongoose.model("User", userSchema);