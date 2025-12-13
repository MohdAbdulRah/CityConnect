const User = require("../models/User");

// 🔹 1) Get current logged-in user's location
exports.getMyLocation = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("name location coordinates");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get My Location Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllUsersLocations = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Check current user location
    const currentUser = await User.findById(userId).select("location coordinates");
    if (
      !currentUser ||
      !currentUser.location ||
      currentUser.location.trim() === "" ||
      !currentUser.coordinates ||
      (currentUser.coordinates.coordinates[0] === 0 &&
        currentUser.coordinates.coordinates[1] === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please add your location first before viewing others",
      });
    }

    const [lng, lat] = currentUser.coordinates.coordinates;

    // 2️⃣ Get users sorted by closest
    const users = await User.find({
      _id: { $ne: userId },
      coordinates: { $ne: null },
      "coordinates.coordinates": { $ne: [0, 0] },
      location: { $exists: true, $ne: "" },
      coordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      },
    }).select("name coordinates location isVerified profileImage");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (error) {
    console.error("Get All Locations Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// 🔹 REMOVE USER LOCATION
exports.removeLocation = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          location: "",
          coordinates: { type: "Point", coordinates: [0, 0] }
        }
      },
      { new: true }
    ).select("name location coordinates isVerified profileImage");

    res.status(200).json({
      success: true,
      message: "Location removed successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Remove Location Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
