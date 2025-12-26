const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose")

// 🔥 GET ALL POSTS (no filter, no pagination)
exports.getAllPost = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    let posts;

    if (lat && lng) {
      // NEAR ME POSTS
      posts = await Post.find({
        owner: { $ne: req.userId },
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)],
            },
          },
        },
      })
        .populate("owner", "_id name email profileImage isVerified")
        .limit(50);
    } else {
      // NORMAL FEED
      posts = await Post.find({ owner: { $ne: req.userId } })
        .populate("owner", "_id name email profileImage isVerified")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// 🔥 CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { content, location, image, lat, lng } = req.body;

    if (!content || !location || !image) {
      return res.status(400).json({
        success: false,
        message: "content, location and image are required",
      });
    }

    // 🔥 validate coords
    const hasValidCoords =
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

    const newPost = await Post.create({
      content,
      location,
      image,
      owner: req.userId,

      // ✅ THIS IS THE KEY FIX
      ...(hasValidCoords && {
        coordinates: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)], // lng first
        },
      }),
    });

    await User.findByIdAndUpdate(
      req.userId,
      { $push: { posts: newPost._id } },
      { new: true }
    );

    const populated = await Post.findById(newPost._id).populate(
      "owner",
      "name email profileImage isVerified"
    );

    res.status(201).json({
      success: true,
      message: "Posted successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAllPost = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    let posts;

    if (lat && lng) {
      // NEAR ME POSTS
      posts = await Post.find({
        owner: { $ne: req.userId },
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)],
            },
          },
        },
      })
        .populate("owner", "_id name email profileImage isVerified")
        .limit(50);
    } else {
      // NORMAL FEED
      posts = await Post.find({ owner: { $ne: req.userId } })
        .populate("owner", "_id name email profileImage isVerified")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// 🔥 CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { content, location, image, lat, lng } = req.body;

    if (!content || !location || !image) {
      return res.status(400).json({
        success: false,
        message: "content, location and image are required",
      });
    }

    // 🔥 validate coords
    const hasValidCoords =
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

    const newPost = await Post.create({
      content,
      location,
      image,
      owner: req.userId,

      // ✅ THIS IS THE KEY FIX
      ...(hasValidCoords && {
        coordinates: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)], // lng first
        },
      }),
    });

    await User.findByIdAndUpdate(
      req.userId,
      { $push: { posts: newPost._id } },
      { new: true }
    );

    const populated = await Post.findById(newPost._id).populate(
      "owner",
      "name email profileImage isVerified"
    );

    res.status(201).json({
      success: true,
      message: "Posted successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getMyPosts = async (req,res) => {
  try {
    const posts = await Post.find({ owner: req.userId })
      .populate("owner", "name email profileImage isVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

exports.getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const posts = await Post.find({ owner: id })
      .populate("owner", "_id name email profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching posts",
    });
  }
};
