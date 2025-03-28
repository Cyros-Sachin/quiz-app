import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false); // New state for waiting time

  // Full-screen mode function (only works on user gesture)
  const enableFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .catch(err => console.log("Fullscreen Error:", err));
    }
  };

  // Detect if user exits fullscreen and end quiz
  const detectExit = useCallback(() => {
    if (!document.fullscreenElement && quizStarted) {
      alert("🚫 You exited fullscreen! The quiz is now over.");
      setQuizEnded(true);  // Disable all interactions
    }
  }, [quizStarted]);

  useEffect(() => {
    socket.on("quizStarted", () => {
      setQuizStarted(true);
      enableFullScreen();  // Trigger fullscreen when quiz starts
    });

    // Fetch questions from the backend
    axios.get("http://localhost:5000/api/questions").then((res) => {
      setQuestions(res.data);
    });

    document.addEventListener("fullscreenchange", detectExit);

    return () => {
      document.removeEventListener("fullscreenchange", detectExit);
      socket.off("quizStarted");
    };
  }, [detectExit]);

  // Handle radio button answer selection (disabled if quiz ended)
  const handleAnswerChange = (questionId, selectedOption) => {
    if (!quizEnded) {
      setAnswers({ ...answers, [questionId]: selectedOption });
    }
  };

  // Handle quiz submission (disabled if quiz ended)
  const handleSubmit = async () => {
    if (quizEnded) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User is not logged in");
      return;
    }
    await axios.post("http://localhost:5000/api/quiz/submit", { userId, answers });
    document.exitFullscreen();
    window.location.href = "/leaderboard";
  };

  // Add a 10-second delay before starting the quiz
  const handleStartQuiz = () => {
    setIsWaiting(true);  // Set the waiting state to true
    enableFullScreen();

    // Trigger quiz start after 10 seconds
    setTimeout(() => {
      socket.emit("startQuiz");  // Trigger the same start function after 10 seconds
      setIsWaiting(false);  // Reset waiting state after the delay
      localStorage.setItem("quizStarted", "true");  // Store the state in localStorage
    }, 10000);  // 10 seconds delay
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#2D2D2D" }}>
      {!quizStarted ? (
        <button 
          style={{
            backgroundColor: "#39FF14",
            color: "black",
            padding: "12px 20px",
            fontSize: "18px",
            borderRadius: "8px",
            cursor: isWaiting ? "not-allowed" : "pointer"  // Disable button during wait
          }}
          onClick={handleStartQuiz} // Trigger start with 10-second delay
          disabled={isWaiting} // Disable button during the waiting time
        >
          {isWaiting ? "Please wait..." : "Start Quiz"}  {/* Show waiting message */}
        </button>
      ) : (
        <div style={{ width: "75%", marginTop: "20px" }}>
          {quizEnded ? (
            <h1 style={{ color: "red", textAlign: "center" }}>❌ Quiz Over! You exited fullscreen.</h1>
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
                      disabled={quizEnded} // Disable selection if quiz ended
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
              cursor: quizEnded || Object.keys(answers).length !== questions.length ? "not-allowed" : "pointer",
              opacity: quizEnded || Object.keys(answers).length !== questions.length ? 0.5 : 1,
            }}
            onClick={handleSubmit}
            disabled={quizEnded || Object.keys(answers).length !== questions.length} // Disable submit if quiz ended
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
