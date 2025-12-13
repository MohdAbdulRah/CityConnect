const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// Create or get chat
router.post("/create", async (req, res) => {
  try {
    const { userIds } = req.body;
    let chat = await Chat.findOne({
      participants: { $all: userIds, $size: userIds.length },
    });

    if (!chat) {
      chat = new Chat({ participants: userIds });
      await chat.save();
    }

    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ FIX: Send message → Save to DB, DON'T emit here
router.post("/:chatId/message", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text } = req.body;

    const message = new Message({
      chat: chatId,
      sender: senderId,
      text,
    });

    await message.save();
    await message.populate("sender", "name phone allowCall");
    await Chat.findByIdAndUpdate(chatId, {
      updatedAt: new Date(),
    });

    const messageToSend = {
      _id: message._id,
      chat: chatId, // ✅ Use 'chat' not 'chatId' to match frontend
      sender: {
        _id: message.sender._id,
        name: message.sender.name,
      },
      text: message.text,
      createdAt: message.createdAt,
    };

    // ✅ DON'T emit here - let the frontend socket.emit handle it
    // This prevents duplicate messages
    
    res.json({ success: true, message: messageToSend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all messages
router.get("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name phone allowCall")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/my-chats", async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name phone profileImage allowCall")
      .sort({ updatedAt: -1 });

    const results = await Promise.all(
      chats.map(async (chat) => {
        const other = chat.participants.filter(
          (p) => p._id.toString() !== userId
        );

        // 🔥 Fetch latest message
        const lastMessage = await Message.findOne({ chat: chat._id })
          .sort({ createdAt: -1 })
          .select("text createdAt sender");

        return {
          _id: chat._id,
          participants: other,
          lastMessage: lastMessage || null,
          updatedAt: chat.updatedAt,
        };
      })
    );

    res.json({ success: true, userId, chats: results });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;