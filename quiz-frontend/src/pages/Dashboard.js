import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://backend-quiz-psi.vercel.app");

function Dashboard() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  // Handle adding a new question
  const handleAddQuestion = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!question || options.some((opt) => opt === "") || !correctAnswer) {
      setStatusMessage("Please fill in all fields.");
      return;
    }

    try {
      await axios.post("https://backend-quiz-psi.vercel.app/api/questions/add", { question, options, correctAnswer });
      setStatusMessage("Question added successfully!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
    } catch (error) {
      setStatusMessage("Failed to add question. Try again!");
    }
  };

  

  // Listen for quiz start event from the server
  useEffect(() => {
    // Listen for the current quiz state from the server
    socket.on("quizState", (data) => {
      setIsQuizStarted(data.quizStarted);  // Set quiz state based on server
    });

    return () => {
      socket.off("quizState");
    };
  }, []);

  const handleStartStop = () => {
    if (isQuizStarted) {
      socket.emit("stopQuiz");  // Stop the quiz
    } else {
      socket.emit("startQuiz");  // Start the quiz
    }
    setIsQuizStarted(!isQuizStarted);  // Toggle the state on the client
  };

  return (
    <div className="bg-darkBg">
      <h1 className="text-neon text-3xl mb-4">Admin Dashboard</h1>

      <label htmlFor="toggle" style={{ display: "block", marginBottom: "10px", fontSize: "18px", color: "#39FF14" }}>
        {isQuizStarted ? "Quiz is currently running. Click to stop." : "Quiz is currently stopped. Click to start."}
      </label>
      <button
        id="toggle"
        onClick={handleStartStop}
        className="bg-neon"
      >
        {isQuizStarted ? "Stop Quiz" : "Start Quiz"}
      </button>

      <form onSubmit={handleAddQuestion} className="bg-gray-900 p-6 rounded-lg w-1/2">
        <input
          type="text"
          className="p-2"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            className="p-2"
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
          className="p-2"
          placeholder="Correct Answer"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />

        <button className="bg-neon">Add Question</button>
      </form>

      {statusMessage && <div className="h1">{statusMessage}</div>}
    </div>
  );
}

export default Dashboard;