const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  answers: { type: Object, required: true },
  date: { type: Date, default: Date.now },
});

const QuizAttempt = mongoose.model("QuizAttempt", QuizAttemptSchema);

module.exports = QuizAttempt;
