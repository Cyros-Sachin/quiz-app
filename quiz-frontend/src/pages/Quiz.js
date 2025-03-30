import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://quiz-app-so3y.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [warningCount, setWarningCount] = useState(0);

  // 🟢 Full-screen mode
  const enableFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .catch(err => console.log("Fullscreen Error:", err));
    }
  };

  // 🛑 Prevent user from exiting fullscreen using ESC key
  const handleExitFullScreen = () => {
    setWarningCount(prev => prev + 1);
    alert(`⚠️ Warning! You cannot exit fullscreen! (${warningCount + 1}/3)`);
    enableFullScreen();
    
    if (warningCount + 1 >= 3) {
      alert("❌ Quiz Over! You violated the rules.");
      setQuizEnded(true);
      handleSubmit(true);
    }
  };

  // Detect ESC press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleExitFullScreen();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [warningCount]);

  // Prevent tab switching
  useEffect(() => {
    const preventTabSwitch = () => {
      if (document.hidden && !quizSubmitted) {
        alert("🚫 You can't switch tabs or minimize the window during the quiz!");
        setWarningCount(prev => prev + 1);
        enableFullScreen();
      }
    };

    document.addEventListener("visibilitychange", preventTabSwitch);
    return () => document.removeEventListener("visibilitychange", preventTabSwitch);
  }, [quizSubmitted]);

  // Prevent right-click (context menu)
  useEffect(() => {
    const preventContextMenu = (event) => event.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  // 🟢 Handle Answer Selection
  const handleAnswerChange = (questionId, selectedOption) => {
    if (!quizEnded) {
      setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    }
  };

  // 🛑 Prevent Duplicate Submissions
  const handleSubmit = async (autoSubmit = false) => {
    if (quizEnded || quizSubmitted) return;
    
    console.log("📢 Final Submitted Answers:", answers);

    if (Object.keys(answers).length === 0) {
      alert("❌ No answers selected! Please attempt at least one question.");
      return;
    }

    let userId = localStorage.getItem("userId");
    if (!userId || userId.length !== 24) {
      alert("❌ Invalid User ID. Please log in again.");
      return;
    }

    try {
      await axios.post("https://quiz-app-so3y.onrender.com/api/quiz/submit", { userId, answers });
      setQuizSubmitted(true);
      console.log("✅ Quiz Submitted Successfully!");

      if (!autoSubmit) document.exitFullscreen();
      window.location.href = "/leaderboard";
    } catch (error) {
      console.error("❌ Submission Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error submitting quiz");
    }
  };

  // ⏳ Timer & Auto Submission
  useEffect(() => {
    let interval;
    if (quizStarted && !quizEnded) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setQuizEnded(true);
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, quizEnded]);

  // 🔹 Fetch Questions & Handle Quiz Start
  useEffect(() => {
    socket.on("quizStarted", () => {
      setQuizStarted(true);
      enableFullScreen();
    });

    axios.get("https://quiz-app-so3y.onrender.com/api/questions")
      .then(res => setQuestions(res.data));

    return () => socket.off("quizStarted");
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#2D2D2D" }}>
      {/* Timer */}
      <div style={{ position: "absolute", top: "20px", right: "20px", color: "white", fontSize: "24px" }}>
        {!quizEnded && `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`}
      </div>

      {/* Start Button */}
      {!quizStarted ? (
        <button style={{ backgroundColor: "#39FF14", padding: "12px 20px", fontSize: "18px", borderRadius: "8px", cursor: "pointer" }}
          onClick={() => setQuizStarted(true)}>
          Start Quiz
        </button>
      ) : (
        <div style={{ width: "75%", marginTop: "20px" }}>
          {quizEnded ? (
            <h1 style={{ color: "red", textAlign: "center" }}>❌ Quiz Over! Time's up.</h1>
          ) : (
            questions.map((q, idx) => (
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
                      disabled={quizEnded}
                      style={{ marginRight: "10px" }}
                    />
                    <label style={{ color: "white" }}>{opt}</label>
                  </div>
                ))}
              </div>
            ))
          )}
          <button
            style={{
              backgroundColor: quizEnded ? "gray" : "#39FF14",
              padding: "10px",
              width: "100%",
              marginTop: "20px",
              borderRadius: "5px",
            }}
            onClick={() => handleSubmit(false)}
            disabled={quizSubmitted}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
