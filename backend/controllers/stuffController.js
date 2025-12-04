// controllers/stuffController.js
const Stuff = require("../models/Stuff");

// GET /api/stuff
// Get all available free items (public route)
exports.getAllStuff = async (req, res) => {
  try {
    // Optional query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Only show available items (not reserved/given)
    const query = { status: "available" };

    // Optional: filter by location (partial match)
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: "i" };
    }

    const total = await Stuff.countDocuments(query);
    const stuff = await Stuff.find(query)
      .populate("owner", "name email") // Show donor name & email
      .sort({ createdAt: -1 })        // Newest first
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