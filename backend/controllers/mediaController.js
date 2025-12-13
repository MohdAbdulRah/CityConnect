// controllers/userController.js  (add this function)

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary (once at server start)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

uploadProfileImage = async (req, res) => {
  try {
    // req.body.image -> base64 string from mobile
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "profile_pictures",
      width: 512,
      height: 512,
      crop: "fill",
      quality: "auto",
      format: "jpg",
    });

    // Update user profileImage
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: result.secure_url },
      { new: true }
    ).select("-password -otp -otpExpire");

    res.json({
      success: true,
      message: "Profile picture updated",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        location: updatedUser.location || "Not set",
        given: updatedUser.given || 0,
        received: updatedUser.received || 0,
        rating: updatedUser.rating?.toFixed(1) || 4.9,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

module.exports = {uploadProfileImage}