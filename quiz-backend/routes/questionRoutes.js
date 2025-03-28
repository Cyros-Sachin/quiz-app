const express = require("express");
const Question = require("../models/Question");

const router = express.Router();

router.post("/add", async (req, res) => {
  const { question, options, correctAnswer } = req.body;
  const newQuestion = new Question({ question, options, correctAnswer });
  await newQuestion.save();
  res.send("Question added");
});

router.get("/", async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

module.exports = router;
