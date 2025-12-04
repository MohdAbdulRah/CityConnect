const User = require("../models/User");
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -otp -otpExpire');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        location: user.location || "Not set",
        given: user.given || 0,
        received: user.received || 0,
        rating: user.rating || 4.9,
        isVerified : user.isVerified || false
      }
    });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

};

