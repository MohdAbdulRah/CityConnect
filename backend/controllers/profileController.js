const User = require("../models/User");
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -otp -otpExpire');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
      success: true,
      user: {
        _id : req.userId,
        name: user.name,
        email: user.email,
        location: user.location || "Not set",
        coordinates : user.coordinates.coordinates,
        profileImage : user.profileImage || null,
        given: user.given || [],
        phone : user.phone || null,
        allowCall : user.allowCall || false,
        received: user.received || [],
        givenTasks: user.givenTasks || [],
        receivedTasks: user.receivedTasks || [],
        posts: user.posts || [],
        rating: user.rating || 4.9,
        isVerified : user.isVerified || false
      }
    });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

};

exports.updateProfileImage = async (req, res) => {
  try {
    const { profileImageUrl } = req.body; // expecting a valid image URL

    // Basic validation
    if (!profileImageUrl || typeof profileImageUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid profileImageUrl (string) is required",
      });
    }

    // Optional: simple URL format check
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(profileImageUrl)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid HTTP/HTTPS URL",
      });
    }

    // Update only the profileImage field
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: profileImageUrl },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpire");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile image updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        location: updatedUser.location || "Not set",
        given: updatedUser.given || 0,
        received: updatedUser.received || 0,
        rating: updatedUser.rating || 4.9,
        isVerified: updatedUser.isVerified || false,
      },
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
// controllers/profileController.js

exports.updateLocation = async (req, res) => {
  try {
    const { location, coordinates } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location string is required",
      });
    }

    await User.findByIdAndUpdate(req.userId, {
      location,
      coordinates: coordinates || {
        type: "Point",
        coordinates: [0, 0],
      },
    });

    res.json({
      success: true,
      message: "Location updated successfully",
    });
  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.addNumber = async (req, res) => {
  try {
    const { phone, allowCall } = req.body;
    const userId = req.userId; // assuming you have user from auth middleware

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { phone, allowCall },
      { new: true, runValidators: true } // returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Add Number Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.addRating = async (req,res) => {
  try{
       const {rating,userId} = req.body;
       if(userId == req.userId.toString()){
          res.status(400).json({success : false,message : "You cant rate yourself"})
       }
  const user = await User.findById(userId);
  if(user.rating != 0)user.rating = Math.round(((user.rating + rating) / 2) * 10) / 10;
  else user.rating = rating;
  await user.save();
    res.status(200).json({success : true,newRating : user.rating})
  }
  catch(err){
    console.log(err)
  }
  

}
