require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");

const quizRoutes = require("./routes/quizRoutes");
const { mongoURI } = require("./config");

const app = express();
const server = http.createServer(app);
mongoose.connect(process.env.MONGO_URI || mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));
// Proper CORS settings for Express
app.use(cors({ origin: "*" }));

// Middleware
app.use(express.json());

// Initialize Socket.io and force WebSockets (NO POLLING)
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

let quizStarted = false;

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.emit("quizState", { quizStarted });

  socket.on("startQuiz", () => {
    quizStarted = true;
    io.emit("quizStarted");
    console.log("📢 Quiz Started!");
  });

  socket.on("stopQuiz", () => {
    quizStarted = false;
    io.emit("quizStopped");
    console.log("📢 Quiz Stopped!");
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Ensure quizRoutes can use Socket.io
if (quizRoutes.setIo) {
  quizRoutes.setIo(io);
}

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/quiz", quizRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
