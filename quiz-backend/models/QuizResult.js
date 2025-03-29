const mongoose = require("mongoose");

const QuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, default: 0 },
  submittedAt: Date,
});

// Virtual field to populate the user's name
QuizResultSchema.virtual("user", {
  ref: "User", // Reference to the User model
  localField: "userId", // Field in QuizResult model
  foreignField: "_id", // Field in User model
  justOne: true, // Get a single user (not an array)
});

module.exports = mongoose.model("QuizResult", QuizResultSchema);
