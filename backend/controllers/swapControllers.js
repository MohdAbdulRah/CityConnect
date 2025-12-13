const User = require("../models/User")
const Swap = require("../models/Swap")

const setSetting = async (req,res) => {
  try{
    const {contains,amount} = req.body;
    const user = await User.findById(req.userId).populate("coordinates")

    const swap = new Swap({
        user : req.userId,
        contains,
        amount,
        swapCoordinates : user.coordinates
    })

    await swap.save();

    res.status(200).json({success : true,message : "Swap Created",swap})
  }
  catch(error){
    console.error("Create swap error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

const getSwapById = async (req,res) => {
  try{
    const swapId = req.params.id;
    const swap = await Swap.findById(swapId)
    if(swap.user.toString() !== req.userId.toString()){
      res.status(400).json({success : false,message : "unAuthorized"})
    }
    res.status(200).json({success : true,message : "Swap got successfully",swap})
  }
  catch(error){
    console.error("get swap error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

const findAdjacentSwaps = async (req,res) => {
  try{
    const swapId = req.params.id;
    const swap = await Swap.findById(swapId)
      .populate("user","coordinates location name _id")
    
    if(swap.user._id.toString() !== req.userId.toString()){
      res.status(400).json({success : false,message : "unAuthorized"})
    }
    const find = swap.contains == 'cash' ? 'online' : 'cash';
    const amount = swap.amount
    
    if (
      !swap ||
      !swap.user.location ||
      swap.user.location.trim() === "" ||
      !swap.user.coordinates ||
      (swap.user.coordinates.coordinates[0] === 0 &&
        swap.user.coordinates.coordinates[1] === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please add your location first before viewing others",
      });
    }
    const [lng, lat] = swap.user.coordinates.coordinates;

    const nearestSwaps = await Swap.aggregate([
      {
        $geoNear : {
          near  : {type : "Point" , coordinates : [lng,lat]},
          distanceField : "distance",
          spherical : true,
          key : "swapCoordinates",
          distanceMultiplier : 0.001
        }
      },
      {
        $match : {
          _id : {$ne : swap._id},
          user: { $ne: swap.user._id },
          contains : find,
          amount : {$gte : amount},
          reciever: null // ✅ Only unmatched swaps
        }
      },
      {
        $lookup : {
          from : "users",
          localField : "user",
          foreignField : "_id",
          as : "user"
        }
      },
      {$unwind : "$user"},
      {$sort : {amount : 1,distance : 1}},
    ])
    res.status(200).json({success : true,message : "Nearest Swaps got successfully",nearestSwaps})
  }
  catch(error){
    console.error("swap find error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

const findOneSwap = async (req, res) => {
  try {
    const swapId = req.params.id;

    const swap = await Swap.findById(swapId)
      .populate("user", "coordinates location name profileImage _id")
      .populate("reciever");

    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }

    // Unauthorized check
    if (swap.user._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const find = swap.contains === "cash" ? "online" : "cash";
    const amount = swap.amount;

    // Check user location
    if (
      !swap.user.location ||
      !swap.user.coordinates ||
      swap.user.location.trim() === "" ||
      (swap.user.coordinates.coordinates[0] === 0 &&
        swap.user.coordinates.coordinates[1] === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please add your location first before viewing others",
      });
    }

    const [lng, lat] = swap.user.coordinates.coordinates;

    // 🟢 1️⃣ IF ALREADY MATCHED — RETURN matchedSwap
    if (swap.reciever) {
      const matchedSwap = await Swap.findById(swap.reciever)
        .populate("user", "name profileImage _id");

      return res.status(200).json({
        success: true,
        matchedSwap,
        nearestSwaps: [],
      });
    }

    // 🔵 2️⃣ ELSE SEARCH FOR NEAREST AVAILABLE SWAPS
    // 🔥 CRITICAL FIX: Check if swaps are being matched by others
    const nearestSwaps = await Swap.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          key: "swapCoordinates",
          distanceMultiplier: 0.001,
        },
      },
      {
        $match: {
          _id: { $ne: swap._id },
          user: { $ne: swap.user._id },
          contains: find,
          amount: { $gte: amount },
          reciever: null, // ✅ CRITICAL: Only get swaps that haven't been matched yet
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $sort: { amount: 1, distance: 1 } },
      { $limit: 1 },
    ]);

    return res.status(200).json({
      success: true,
      nearestSwaps,
      matchedSwap: null,
    });
  } catch (error) {
    console.error("FindOneSwap Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const receiveSwap = async (req, res) => {
  try {
    let { senderSwapId, recieverSwapId } = req.body;

    if (!senderSwapId || !recieverSwapId) {
      return res.status(400).json({ 
        success: false, 
        message: "Both IDs required",
        alreadyMatched: false 
      });
    }

    // 🔥 CANONICAL ORDER: Always sort IDs alphabetically
    const [firstId, secondId] = 
      senderSwapId < recieverSwapId 
        ? [senderSwapId, recieverSwapId]
        : [recieverSwapId, senderSwapId];

    console.log("Canonical pair:", firstId, "<->", secondId);

    // Fetch both swaps
    const [swap1, swap2] = await Promise.all([
      Swap.findById(firstId),
      Swap.findById(secondId)
    ]);

    if (!swap1 || !swap2) {
      return res.status(404).json({ success: false, message: "Swap not found" });
    }

    // Check if ALREADY matched (either direction)
    const isAlreadyMatched = 
      swap1.reciever || 
      swap2.reciever ||
      swap1.reciever === secondId || 
      swap2.reciever === firstId;

    if (isAlreadyMatched) {
      console.log("✅ Already matched (mutual or otherwise)");
      return res.status(200).json({ 
        success: true, 
        message: "Already matched!", 
        alreadyMatched: true  // ← Important: client should stop polling
      });
    }

    // Now safely match them
    await Promise.all([
      Swap.findByIdAndUpdate(firstId, { reciever: secondId }),
      Swap.findByIdAndUpdate(secondId, { reciever: firstId })
    ]);

    console.log("✅ Match created successfully:", firstId, "<->", secondId);

    return res.status(200).json({
      success: true,
      message: "Swaps matched successfully",
    });

  } catch (error) {
    console.error("Receive Swap Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const cancelSwap = async (req, res) => {
  try {
    const swapId = req.params.id;

    // Find swap
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: "Swap not found",
      });
    }

    // Check if the logged-in user is the owner of the swap
    if (swap.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot cancel this swap",
      });
    }

    // 🔥 NEW: If swap was matched, also clear the other swap's receiver field
    if (swap.reciever) {
      await Swap.findByIdAndUpdate(swap.reciever, { reciever: null });
    }

    // Delete the swap
    await Swap.findByIdAndDelete(swapId);

    res.status(200).json({
      success: true,
      message: "Swap cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Swap error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {setSetting,getSwapById,findAdjacentSwaps,findOneSwap,cancelSwap,receiveSwap}