require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const quizRoutes = require("./routes/quizRoutes");
const { mongoURI } = require("./config");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", quizRoutes);

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  // Listen for the "startQuiz" event to broadcast to all users after a delay
  socket.on("startQuiz", () => {
    console.log("🚀 Quiz will start in 10 seconds...");
    // Wait for 10 seconds before broadcasting the quiz started event
    setTimeout(() => {
      io.emit("quizStarted");
      console.log("📢 Quiz Started!");
    }, 10000); // 10 seconds delay
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
