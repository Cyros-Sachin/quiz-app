const express = require("express");
const Question = require("../models/Question");
const QuizResult = require("../models/QuizResult");

const router = express.Router();

// Route to submit the quiz answers
router.post("/submit", async (req, res) => {
  const { userId, answers } = req.body;
  let score = 0;

  try {
    // Fetch all questions from the database
    const questions = await Question.find();

    // Check answers and calculate score
    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        score++;
      }
    });

    // Save the quiz result with the score and userId
    const quizResult = await new QuizResult({ userId, score, submittedAt: new Date() }).save();

    res.send({ userId: userId }); // Ensure the userId is returned in the response
  } catch (err) {
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
