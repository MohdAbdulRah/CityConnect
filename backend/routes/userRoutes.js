// backend/routes/userRoutes.js (create if doesn't exist)
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching user with ID:", userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/all/users", async (req, res) => {
  try {
    const currentUserId = req.userId;

    const users = await User.find({ _id: { $ne: currentUserId } })

    res.json({ success: true, users });
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;