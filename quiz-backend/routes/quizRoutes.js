const express = require("express");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const QuizResult = require("../models/QuizResult");
const { Server } = require("socket.io");  // Import Socket.io

const router = express.Router();
let io;  // Declare io variable to emit events from the routes

// Function to initialize socket.io
router.setIo = (socketServer) => {
  io = new Server(socketServer);
};

// Route to submit the quiz answers
router.post("/submit", async (req, res) => {
  console.log("📩 Received quiz submission:", req.body); // Log incoming data
  let { userId, answers } = req.body;
  let score = 0;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if `userId` is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid User ID format:", userId);
      return res.status(400).json({ message: `Invalid User ID format: ${userId}` });
    }

    // Check if the user has already attempted the quiz
    const existingResult = await QuizResult.findOne({ userId });
    if (existingResult) {
      console.log("❌ User has already attempted the quiz.");
      return res.status(400).json({ message: "You have already attempted the quiz" });
    }

    userId = new mongoose.Types.ObjectId(userId); // Convert string to ObjectId

    // Fetch all questions from the database
    const questions = await Question.find();

    // Check answers and calculate score
    questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) {
        score += 1; // +1 for correct answer
      } else if (answers[q._id] && answers[q._id] !== q.correctAnswer) {
        score -= 0.25; // -0.25 for wrong answer
      }
    });

    // Save the quiz result with the score and userId
    const result = new QuizResult({ userId, score, submittedAt: new Date() });
    await result.save();

    // Emit updated leaderboard
    const updatedLeaderboard = await QuizResult.find().populate("userId").sort({ score: -1, submittedAt: 1 });
    io.emit("leaderboardUpdated", updatedLeaderboard);  // Emit event to clients

    res.send("✅ Quiz submitted successfully");
  } catch (err) {
    console.error("❌ Error submitting quiz:", err);
    res.status(500).json({ message: "Error submitting quiz", error: err.message });
  }
});

// Route to get the leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    // Get leaderboard sorted by score and time of submission
    const leaderboard = await QuizResult.find().populate("userId").sort({ score: -1, submittedAt: 1 });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard", error: err.message });
  }
});

module.exports = router;
