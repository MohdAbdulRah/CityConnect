// 3. Task.js (SwiftTasks Module)
const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // requester
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true, min: 50 }, // minimum ₹50
  urgency: { type: String, enum: ['now', 'today', 'this_week', 'anytime'], default: 'anytime' },
  address: String,
  
  status: { 
    type: String, 
    enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'], 
    default: 'open' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: Date,
  
  applicants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    appliedAt: { type: Date, default: Date.now }
  }],
  expiryAt: { type: Date },
}, { timestamps: true });

TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ coordinates: "2dsphere" });

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
