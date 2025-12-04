require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");
const stuffRoutes = require("./routes/stuffRoutes");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/me",authMiddleware, profileRoutes);
app.use("/api/stuff", stuffRoutes);

app.get("/", (req, res) => res.send("API working ✔"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
