import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);

  // Full-screen mode function
  const enableFullScreen = () => {
    document.documentElement.requestFullscreen().catch((err) => console.log("Error:", err));
  };

  // Detect if user exits fullscreen
  const detectExit = useCallback(() => {
    if (!document.fullscreenElement) {
      alert("⚠️ Stay in full-screen mode during the quiz!");
      enableFullScreen();
    }
  }, []); // Memoizing detectExit function

  useEffect(() => {
    socket.on("quizStarted", () => {
      setQuizStarted(true);
      enableFullScreen();
    });

    // Fetching questions from API
    axios.get("http://localhost:5000/api/questions").then((res) => {
      setQuestions(res.data);
    });

    // Adding event listener for fullscreen change
    document.addEventListener("fullscreenchange", detectExit);

    return () => {
      document.removeEventListener("fullscreenchange", detectExit);
      socket.off("quizStarted");
    };
  }, [detectExit]); // Dependency on detectExit function

  // Handle radio button answer selection
  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    await axios.post("http://localhost:5000/api/quiz/submit", { userId, answers });
    document.exitFullscreen();
    window.location.href = "/leaderboard";
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#2D2D2D" }}>
      {!quizStarted ? (
        <h1 style={{ color: "#39FF14", fontSize: "30px" }}>Waiting for the admin to start...</h1>
      ) : (
        <div style={{ width: "75%", marginTop: "20px" }}>
          {questions.map((q, idx) => (
            <div key={q._id} style={{ backgroundColor: "#1A1A1A", padding: "20px", borderRadius: "8px", marginBottom: "10px" }}>
              <h2 style={{ color: "#39FF14" }}>{idx + 1}. {q.question}</h2>
              {q.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => handleAnswerChange(q._id, opt)}
                    style={{ marginRight: "10px" }}
                  />
                  <label style={{ color: "white" }}>{opt}</label>
                </div>
              ))}
            </div>
          ))}
          <button
            style={{
              backgroundColor: "#39FF14",
              padding: "10px",
              width: "100%",
              marginTop: "20px",
              borderRadius: "5px",
              cursor: Object.keys(answers).length !== questions.length ? "not-allowed" : "pointer",
              opacity: Object.keys(answers).length !== questions.length ? 0.5 : 1,
            }}
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
