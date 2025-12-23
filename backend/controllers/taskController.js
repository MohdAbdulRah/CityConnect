const User = require("../models/User");
const Task = require("../models/Task")
const mongoose = require("mongoose");
exports.createTask = async (req, res) => {
  try {
    const userId = req.userId; // <-- from middleware

    const { title, description, amount, urgency, address, expiryAt } = req.body;

    // 1️⃣ Create Task
    const task = await Task.create({
      user: userId,   // requester
      title,
      description,
      amount,
      urgency,
      address,
      expiryAt
    });

    // 2️⃣ Push task into user's givenTasks
    await User.findByIdAndUpdate(userId, {
      $push: { givenTasks: task._id }
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
      success: true
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Task creation failed", success: false });
  }
};


// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.userId; // current logged-in user

    const tasks = await Task.find({
      status: "open",                 // ✅ ONLY OPEN TASKS
      user: { $ne: userId },           // exclude own tasks
      "applicants.user": { $ne: userId } // exclude already applied tasks
    })
      .populate("user", "_id name email profileImage")
      .populate("assignedTo", "_id name email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};



exports.applyTasks = async (req,res) => {
  try {
    const userId = req.userId; // current logged-in user
    const { message } = req.body;
    const { taskId } = req.params;

    // Find task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Check if user already applied
    const alreadyApplied = task.applicants.some(
      (app) => app.user.toString() === userId
    );
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "You already applied to this task" });
    }

    // Push applicant
    task.applicants.push({
      user: userId,
      message: message?.trim() || "",
      appliedAt: new Date()
    });

    await task.save();

    res.status(200).json({ success: true, message: "Applied to task successfully", task });
  } catch (err) {
    console.error("Apply task error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

exports.myGivenTasks = async (req, res) => {
  try {
    const userId = req.userId; // logged-in user

    // Fetch tasks with population
    let tasks = await Task.find({ user: userId })
      .populate("user", "name email profileImage location")         // task owner
      .populate("assignedTo", "_id name email profileImage")   // assigned user
      .populate({
        path: "applicants.user",
        model: "User",
        select: "_id name email profileImage"                  // applicant details
      });

    // Define custom status order
    const statusOrder = {
      open: 1,
      assigned: 2,
      in_progress: 3,
      completed: 4,
      cancelled: 5
    };

    // Sort tasks by statusOrder first, then by createdAt descending
    tasks.sort((a, b) => {
      const statusCompare = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      if (statusCompare !== 0) return statusCompare;
      return b.createdAt - a.createdAt; // newest first
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};


exports.myRecvTasks = async (req, res) => {
  try {
    const userId = req.userId;

    const tasks = await Task.find({ assignedTo: userId })
      .populate("user", "_id name email profileImage")       // Task creator
      .populate("assignedTo", "_id name email profileImage") // Assignee
      .sort({ createdAt: -1 });                          // latest first

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (err) {
    console.error("Error in myRecvTasks:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching received tasks",
    });
  }
};

exports.myApplTasks = async (req, res) => {
  try {
    const userId = req.userId;

    // Find tasks where applicants array contains this user
    const tasks = await Task.find({
      "applicants.user": userId
    })
    .populate("user", "name email profileImage")          // task creator
    .populate("assignedTo", "name email profileImage")    // if assigned
    .populate("applicants.user", "name email profileImage"); // applicant details

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("Error fetching applied tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


exports.giveTasks = async (req, res) => {
  try {
    const { userid, taskid } = req.body;

    if (!userid || !taskid) {
      return res.status(400).json({
        message: "userid and taskid are required",
      });
    }

    // 1️⃣ Find task
    const task = await Task.findById(taskid);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2️⃣ Ensure task is open
    if (task.status !== "open") {
      return res.status(400).json({
        message: "Task is already assigned or not open",
      });
    }

    // 3️⃣ Update task
    task.status = "assigned";
    task.assignedTo = userid;
    await task.save();

    // 4️⃣ Update user (add task to receivedTasks)
    const user = await User.findByIdAndUpdate(
      userid,
      { $addToSet: { receivedTasks: taskid } }, // avoids duplicates
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Task successfully assigned",
      task,
    });

  } catch (error) {
    console.error("giveTasks error:", error);
    return res.status(500).json({
      message: "Failed to assign task",
      error: error.message,
    });
  }
};

exports.getGivenTaskByOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const tasks = await Task.find({ user: id })
      .populate("assignedTo")
      .populate("user")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching given tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch given tasks",
    });
  }
};

exports.getRecievedTaskByOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate({
        path: "receivedTasks",
        populate: [
          { path: "user", select: "name email profileImage" },       // task owner
          { path: "assignedTo", select: "name email profileImage" }, // assigned user
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
      count: user.receivedTasks.length,
      tasks: user.receivedTasks,
    });
  } catch (error) {
    console.error("Error fetching received tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch received tasks",
    });
  }
};
