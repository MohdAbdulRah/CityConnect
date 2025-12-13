// backend/index.js  ← Your main entry point (run this with node index.js or nodemon)
const server = require("./server");
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 SERVER RUNNING                    ║
  ║   📍 Port: ${PORT}                        ║
  ║   🌐 Local: http://localhost:${PORT}      ║
  ║   🔌 Socket.IO: Ready                  ║
  ╚════════════════════════════════════════╝
  `);
});