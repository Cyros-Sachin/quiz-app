import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://quiz-app-so3y.onrender.com", {
  transports: ["websocket"], // Force WebSocket connection (no polling)
  withCredentials: true, // If you need credentials (cookies, etc.)
});

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [adminStarted, setAdminStarted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false); // Track if user has already attempted
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // Timer in seconds (30 minutes)

  // Full-screen mode function
  const enableFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .catch(err => console.log("Fullscreen Error:", err));
    }
  };

  // Prevent user from switching tabs or minimizing window
  const preventTabSwitch = useCallback(() => {
    if (document.hidden) {
      alert("🚫 You can't switch tabs or minimize the window during the quiz!");
      setQuizEnded(true); // End quiz if user switches tabs
    }
  }, []);

  // Disable all keyboard events
  const disableKeyboard = (event) => {
    if (quizStarted && !quizEnded) {
      event.preventDefault();  // Prevent all keyboard input during the quiz
    }
  };

  // Detect if user tries to minimize or switch tabs
  const handleBlur = () => {
    if (quizStarted && !quizEnded) {
      alert("🚫 You minimized the window! The quiz is now over.");
      setQuizEnded(true);  // End the quiz if window loses focus
    }
  };

  const preventContextMenu = (event) => {
    event.preventDefault();
  };

  useEffect(() => {

    socket.on("quizStarted", () => {
      setQuizStarted(true);
      enableFullScreen(); // Trigger fullscreen when quiz starts
    });

    // Fetch questions from the backend
    axios.get("https://quiz-app-so3y.onrender.com/api/questions").then((res) => {
      setQuestions(res.data);
    });

    // Prevent right-click (context menu)
    document.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("keydown", disableKeyboard);
    document.addEventListener("visibilitychange", preventTabSwitch);  // Detect tab switches
    window.addEventListener("blur", handleBlur);  // Detect if window loses focus

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("keydown", disableKeyboard);
      document.removeEventListener("visibilitychange", preventTabSwitch);
      window.removeEventListener("blur", handleBlur);  // Remove event listeners when component unmounts
      socket.off("quizStarted");
    };
  }, [quizStarted, quizEnded, preventTabSwitch, handleBlur]);

  // Handle radio button answer selection (disabled if quiz ended)
  const handleAnswerChange = (questionId, selectedOption) => {
    if (!quizEnded) {
      setAnswers({ ...answers, [questionId]: selectedOption });
    }
  };

  // Handle quiz submission (disabled if quiz ended)
  const handleSubmit = async () => {
    if (quizEnded) return;

    let userId = localStorage.getItem("userId");
    console.log("📢 User ID before submitting:", userId); // Debugging log
    if (!userId || userId.length !== 24) {
      alert("❌ Invalid User ID. Please log in again.");
      return;
    }

    try {
      await axios.post("https://quiz-app-so3y.onrender.com/api/quiz/submit", { userId, answers });
      setQuizEnded(true);
      setQuizSubmitted(true);
      localStorage.setItem("quizAttempted", "true");  // Set flag that quiz has been attempted
      document.exitFullscreen();
      window.location.href = "/leaderboard";
    } catch (error) {
      console.error("❌ Quiz submission error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error submitting quiz");
    }
  };

  // Timer countdown logic
  useEffect(() => {
    let interval;
    if (quizStarted && !quizEnded) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleSubmit(); // Automatically submit the quiz when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, quizEnded]);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Add a 10-second delay before starting the quiz
  const handleStartQuiz = () => {
    setIsWaiting(true);  // Set the waiting state to true
    enableFullScreen();

    // Wait for the admin to start the quiz
    setTimeout(() => {
      setIsWaiting(false);  // Reset waiting state after the delay
      localStorage.setItem("quizStarted", "true");  // Store the state in localStorage
    }, 10000);  // 10 seconds delay
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#2D2D2D" }}>
      {/* Timer at the top */}
      <div style={{ position: "absolute", top: "20px", right: "20px", color: "white", fontSize: "24px" }}>
        {!quizEnded && formatTime(timeRemaining)}
      </div>

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
