import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Dashboard() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Handle adding a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!question || options.some((opt) => opt === "") || !correctAnswer) {
      setStatusMessage("Please fill in all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/questions/add", { question, options, correctAnswer });
      setStatusMessage("Question added successfully!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
    } catch (error) {
      setStatusMessage("Failed to add question. Try again!");
    }
  };

  // Start the quiz
  const startQuiz = () => {
    socket.emit("startQuiz");
    setStatusMessage("🚀 Quiz started!");
  };

  // Listen for quiz start event from the server
  useEffect(() => {
    socket.on("quizStarted", () => {
      setStatusMessage("Quiz has started!");
    });

    return () => {
      socket.off("quizStarted");
    };
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-darkBg">
      <h1 className="text-neon text-3xl mb-4">Admin Dashboard</h1>

      <button className="bg-neon p-2 mb-4" onClick={startQuiz}>Start Quiz</button>

      <form onSubmit={handleAddQuestion} className="bg-gray-900 p-6 rounded-lg w-1/2">
        <input
          type="text"
          className="p-2 mb-2 w-full"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            className="p-2 mb-2 w-full"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => {
              let newOptions = [...options];
              newOptions[idx] = e.target.value;
              setOptions(newOptions);
            }}
          />
        ))}

        <input
          type="text"
          className="p-2 mb-2 w-full"
          placeholder="Correct Answer"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />

        <button className="bg-neon p-2 w-full">Add Question</button>
      </form>

      {statusMessage && <div className="text-white mt-4">{statusMessage}</div>}
    </div>
  );
}

export default Dashboard;
