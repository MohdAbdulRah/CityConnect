// controllers/stuffController.js
const Stuff = require("../models/Stuff");
const User = require("../models/User");
const mongoose = require("mongoose")

// GET /api/stuff
// Get all available free items (public route)
exports.getAllStuff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      status: "available",
      owner: { $ne: req.userId },                     // Do not show user's own items
      interested: { $not: { $elemMatch: { user: req.userId } } } // Exclude already interested items
    };

    // Location filter
    if (req.query.location) {
      query.location = { 
        $regex: req.query.location.trim(), 
        $options: "i" 
      };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    const total = await Stuff.countDocuments(query);

    const stuff = await Stuff.find(query)
      .populate("owner", "_id name email profileImage isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: stuff.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: stuff,
    });

  } catch (error) {
    console.error("Get all stuff error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Optional: Get single item by ID
exports.getStuffById = async (req, res) => {
  try {
    const stuff = await Stuff.findById(req.params.id)
      .populate("owner", "name email")
      .populate("interested.user", "name");

    if (!stuff || stuff.status !== "available") {
      return res.status(404).json({
        success: false,
        message: "Item not found or no longer available",
      });
    }

    res.status(200).json({
      success: true,
      data: stuff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createStuff = async (req, res) => {
  try {
    const { title, description, location, image ,lat,lng} = req.body;

    // Validation
    if (!title || !description || !location || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required including image",
      });
    }
    let coordinates;


    // Case 1: Auto-detected location
    coordinates = {
      type: "Point",
      coordinates: [lng, lat],
    };
  
    // Optional: Validate image URL (basic check)
    const urlRegex = /^https?:\/\/.*\.(jpeg|jpg|png|gif|webp)/i;
    if (!urlRegex.test(image)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid image URL",
      });
    }

    const newStuff = await Stuff.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      image, // ← Just a string URL
      coordinates,
      owner: req.userId,
    });

    await User.findByIdAndUpdate(
      req.userId,
      {
        $push: { given: newStuff._id },
      }
    );

    // Populate owner for response
    const populatedStuff = await Stuff.findById(newStuff._id).populate(
      "owner",
      "name email profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Item posted successfully!",
      data: populatedStuff,
    });
  } catch (error) {
    console.error("Create stuff error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
exports.interestInStuff = async (req, res) => {
  try {
    const { stuffId, message } = req.body;
    const userId = req.userId;

    if (!stuffId) {
      return res.status(400).json({
        success: false,
        message: "stuffId is required",
      });
    }

    // Check if stuff exists and still available
    const stuff = await Stuff.findById(stuffId);
    if (!stuff || stuff.status !== "available") {
      return res.status(404).json({
        success: false,
        message: "Item not found or unavailable",
      });
    }

    // Prevent user from adding interest twice
    const alreadyInterested = stuff.interested.some(
      (i) => i.user.toString() === userId
    );

    if (alreadyInterested) {
      return res.status(400).json({
        success: false,
        message: "You have already shown interest in this item",
      });
    }

    // Add new interest
    stuff.interested.push({
      user: userId,
      message: message?.trim() || "",
    });

    await stuff.save();

    return res.status(200).json({
      success: true,
      message: "Interest added successfully",
      data: stuff,
    });
  } catch (error) {
    console.error("Interest error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMyStuffs = async (req, res) => {
  try {
    const userId = req.userId; // from auth middleware

    // Find the user and populate the "given" array with Stuff documents
    const user = await User.findById(userId)
  .populate({
    path: "given",
    model: "Stuff",
        populate: [
      {
        path: "interested.user",
        model: "User",
      },
      {
        path: "givenTo",  // populate the assigned user if stuff is given
        model: "User",
      },
    ],

  });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
     user.given.forEach(stuff => {
  stuff.interested.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});
    user.given.sort((a, b) => {
  const order = { available: 1, reserved: 2, given: 3 };
  return order[a.status] - order[b.status];
});
    return res.status(200).json({
      success: true,
      count: user.given.length,
      stuffs: user.given,
    });

  } catch (err) {
    console.error("Error fetching my stuffs:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getRecievedStuffs = async (req,res) => {
   try {
    const userId = req.userId; // from auth middleware

    // Find the user and populate the "given" array with Stuff documents
    const user = await User.findById(userId).populate({
      path: "received",
      model: "Stuff",
      populate: [
        {
        path: "owner",
        model: "User",
      },
      {
        path: "givenTo",  // populate the assigned user if stuff is given
        model: "User",
      },
    ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      count: user.received.length,
      stuffs: user.received,
    });

  } catch (err) {
    console.error("Error fetching my stuffs:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

exports.myInterest = async (req, res) => {
  try {
    const userId = req.userId;

    // Find stuffs where interested array contains this user
    const stuffs = await Stuff.find({
      "interested.user": userId
    })
      .populate("owner", "name email profileImage")              // owner details
      .populate("interested.user", "name email profileImage");  // interested users' details

    return res.status(200).json({
      success: true,
      count: stuffs.length,
      stuffs,
    });
  } catch (error) {
    console.error("Error fetching interested stuffs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.giveStufftoUser = async (req, res) => {
  try {
    const { userid, stuffid } = req.body;

    // 1️⃣ Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userid) || !mongoose.Types.ObjectId.isValid(stuffid)) {
      return res.status(400).json({ message: "Invalid user or stuff ID" });
    }

    // 2️⃣ Find stuff
    const stuff = await Stuff.findById(stuffid);
    if (!stuff) {
      return res.status(404).json({ message: "Stuff not found" });
    }

    // 3️⃣ Only owner can give the stuff
    if (stuff.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to give this stuff" });
    }

    // 4️⃣ Prevent double-giving
    if (stuff.status === "given") {
      return res.status(400).json({ message: "This stuff is already given" });
    }

    // 5️⃣ Update stuff
    stuff.status = "given";
    stuff.givenTo = userid;
    await stuff.save();

    // 6️⃣ Update receiver
    await User.findByIdAndUpdate(
      userid,
      { $addToSet: { received: stuffid } } // avoids duplicates
    );

    // 7️⃣ Update owner
    // await User.findByIdAndUpdate(
    //   stuff.owner,
    //   { $addToSet: { given: stuffid } }
    // );

    return res.status(200).json({
      message: "Stuff successfully given",
      stuffId: stuffid,
      givenTo: userid,
    });

  } catch (error) {
    console.error("giveStufftoUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStuffByUser = async (req, res) => {
  try {
    const { id } = req.params; // userId

    const stuffs = await Stuff.find({ owner: id })
      .populate("owner", "name email profileImage")
      .populate("interested.user", "name email profileImage")
      .populate("givenTo", "name email profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: stuffs.length,
      stuffs,
    });

  } catch (error) {
    console.error("Get Stuff By User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user's stuffs",
    });
  }
};

exports.getRecvStuffUser = async (req, res) => {
  try {
    const { userid } = req.params;

    const user = await User.findById(userid)
      .populate({
        path: "received",
        populate: [
          { path: "owner", select: "name email profileImage" },
          { path: "givenTo", select: "name email profileImage" },
        ],
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: user.received.length,
      stuffs: user.received,
    });

  } catch (error) {
    console.error("Get Received Stuff Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch received stuffs",
    });
  }
};
