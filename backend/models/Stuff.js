// models/Stuff.js
const mongoose = require("mongoose");

const stuffSchema = new mongoose.Schema(
  {
    // Main Info
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Image (store URL from Cloudinary, Firebase, etc.)
    image: {
      type: String,
      required: true,
    },

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

    // Owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ["available", "reserved", "given"],
      default: "available",
    },

    // Interested users (for "I'm Interested" feature)
    interested: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
          trim: true,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Given to whom (when marked as given)
    givenTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Geo index for future "near me" feature
stuffSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Stuff", stuffSchema);