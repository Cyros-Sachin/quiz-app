const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: Number,
  submittedAt: Date,
});

module.exports = mongoose.model("QuizResult", QuizResultSchema);
