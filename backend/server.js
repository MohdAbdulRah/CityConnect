require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// ✅ CRITICAL: Middleware order matters
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"],
  })
);
app.set("trust proxy", 1);

connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/me", require("./middlewares/authMiddleware"), require("./routes/profileRoutes"));
app.use("/api/stuff", require("./middlewares/authMiddleware"), require("./routes/stuffRoutes"));
app.use("/api/tasks", require("./middlewares/authMiddleware"), require("./routes/taskRoutes"));
app.use("/api/posts", require("./middlewares/authMiddleware"), require("./routes/postRoutes"));
app.use("/api/location", require("./middlewares/authMiddleware"), require("./routes/locationRoutes"));
app.use("/api/swaps", require("./middlewares/authMiddleware"), require("./routes/swapRoutes"));
app.use("/api/chats", require("./middlewares/authMiddleware"), require("./routes/chatRoutes"));
app.use("/api/users", require("./middlewares/authMiddleware"), require("./routes/userRoutes"));

// ✅ Health check endpoint
app.get("/", (req, res) => res.json({ 
  status: "API & Socket.IO Running",
  timestamp: new Date().toISOString()
}));

app.get("/health", (req, res) => {
  const socketCount = app.get("io") ? app.get("io").engine.clientsCount : 0;
  res.json({
    status: "ok",
    socketConnections: socketCount,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// ✅ CRITICAL: Socket.IO configuration for tunnels (ngrok/cloudflare)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"],
  },
  // ✅ IMPORTANT: Transport configuration
  transports: ["polling", "websocket"], // Try polling first
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8,
  // ✅ Path must match frontend
  path: "/socket.io/",
  allowUpgrades: true,
  perMessageDeflate: false,
  httpCompression: false,
});

// Make io globally accessible
app.set("io", io);

// ============================================
// ✅ SOCKET.IO CONNECTION HANDLER
// ============================================
io.on("connection", (socket) => {
  console.log("✅ NEW SOCKET CONNECTED:", socket.id);
  console.log("   Transport:", socket.conn.transport.name);
  console.log("   Total clients:", io.engine.clientsCount);

  // Track transport upgrades
  socket.conn.on("upgrade", (transport) => {
    console.log("🔄 Transport upgraded to:", transport.name);
  });

  // Join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`👤 Socket ${socket.id} joined chat: ${chatId}`);
  });

  // ✅ FIX: Handle sendMessage from client
  socket.on("sendMessage", (data) => {
    console.log("📨 Received message via socket:", data);
    
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(data.chatId || data.chat).emit("receiveMessage", data);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, "Reason:", reason);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.log("⚠️ Socket error:", error);
  });
});

// ✅ Engine-level error handling
io.engine.on("connection_error", (err) => {
  console.log("❌ Engine connection error:");
  console.log("   Code:", err.code);
  console.log("   Message:", err.message);
  console.log("   Context:", err.context);
});
module.exports = server;