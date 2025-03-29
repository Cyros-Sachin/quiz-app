const mongoose = require("mongoose");

const quizStateSchema = new mongoose.Schema({
  quizStarted: {
    type: Boolean,
    required: true,
    default: false, // Default is false (quiz is not started)
  },
});

const QuizState = mongoose.model("QuizState", quizStateSchema);

module.exports = QuizState;
