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
  const [timeRemaining, setTimeRemaining] = useState(5);

  const enableFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log("Fullscreen Error:", err));
    }
  };

  const handleSubmit = async () => {
    if (quizEnded) return;

    let userId = localStorage.getItem("userId");
    if (!userId || userId.length !== 24) {
      alert("❌ Invalid User ID. Please log in again.");
      return;
    }

    try {
      await axios.post("https://quiz-app-so3y.onrender.com/api/quiz/submit", { userId, answers });
      setQuizEnded(true);
      document.exitFullscreen();
      window.location.href = "/leaderboard";
    } catch (error) {
      console.error("❌ Quiz submission error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error submitting quiz");
    }
  };

  useEffect(() => {
    socket.on("quizStarted", () => {
      setQuizStarted(true);
      enableFullScreen();
    });

    axios.get("https://quiz-app-so3y.onrender.com/api/questions").then((res) => {
      setQuestions(res.data);
    });

    return () => {
      socket.off("quizStarted");
    };
  }, []);

  useEffect(() => {
    let interval;
    if (quizStarted && !quizEnded) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizEnded]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (quizStarted && !quizEnded) {
        event.preventDefault();
        event.returnValue = "You have an ongoing quiz. Leaving will submit your answers automatically.";
        handleSubmit();
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizStarted, quizEnded]);

  const handleAnswerChange = (questionId, selectedOption) => {
    if (!quizEnded) {
      setAnswers((prevAnswers) => ({ ...prevAnswers, [questionId]: selectedOption }));
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#2D2D2D" }}>
      <div style={{ position: "absolute", top: "20px", right: "20px", color: "white", fontSize: "24px" }}>
        {!quizEnded && formatTime(timeRemaining)}
      </div>

      {quizStarted ? (
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
            style={{ backgroundColor: quizEnded ? "gray" : "#39FF14", padding: "10px", width: "100%", marginTop: "20px", borderRadius: "5px" }}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      ) : (
        <button
          style={{ backgroundColor: "#39FF14", color: "black", padding: "12px 20px", fontSize: "18px", borderRadius: "8px", cursor: "pointer" }}
          onClick={() => setQuizStarted(true)}
        >
          Start Quiz
        </button>
      )}
    </div>
  );
}

export default Quiz;
