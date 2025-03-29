require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const quizRoutes = require("./routes/quizRoutes"); // Ensure quizRoutes is properly updated
const { mongoURI } = require("./config");

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: "https://quiz-app-xi-lac.vercel.app", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ✅ Apply CORS for Socket.io
const io = socketIo(server, {
  cors: {
    origin: "https://quiz-app-xi-lac.vercel.app", // Your frontend URL
    methods: ["GET", "POST"],
  },
});


let quizStarted = false;  // Global state for whether the quiz is started

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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

  socket.emit("quizState", { quizStarted });
  // Listen for the "startQuiz" event to broadcast to all users after a delay
  socket.on("startQuiz", () => {
    io.emit("quizStarted");
    console.log("📢 Quiz Started!");
  });

  socket.on("stopQuiz", () => {
    quizStarted = false;  // Set quiz as stopped
    io.emit("quizStopped");  // Emit the event to notify all users
    console.log("📢 Quiz stopped!");
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Setup quiz routes for real-time leaderboard updates
quizRoutes.setIo(io);  // Ensure quizRoutes can emit real-time leaderboard updates

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT,() => {
  console.log(`🚀 Server running on port ${PORT}`);
});
