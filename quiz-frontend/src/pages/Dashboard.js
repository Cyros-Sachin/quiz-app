import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://quiz-app-so3y.onrender.com", {
  transports: ["websocket"], // Force WebSocket connection (no polling)
  withCredentials: true, // If you need credentials (cookies, etc.)
});
function Dashboard() {
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  // Handle adding a new question

  

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
        className="but"
      >
        {isQuizStarted ? "Stop Quiz" : "Start Quiz"}
      </button>

    </div>
  );
}

export default Dashboard;