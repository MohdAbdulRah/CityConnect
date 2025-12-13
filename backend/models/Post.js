// models/Stuff.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
   
    content: {
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
  },
  {
    timestamps: true,
  }
);

// Geo index for future "near me" feature
postSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Post", postSchema);