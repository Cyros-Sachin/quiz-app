import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://quiz-app-so3y.onrender.com", {
  transports: ["websocket"], // Force WebSocket connection (no polling)
  withCredentials: true, // If you need credentials (cookies, etc.)
});

function Quiz() {
  const [adminStarted, setAdminStarted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false); // Track if user has already attempted
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10); // Timer in seconds (10 sec for testing, change as needed)
  const [exitWarnings, setExitWarnings] = useState(0); // Track ESC warnings

  // Full-screen mode function
  const enableFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .catch(err => console.log("Fullscreen Error:", err));
    }
  };

  // Auto-submit when timer ends
  const autoSubmit = async () => {
    if (!quizSubmitted) {
      console.log("⏳ Auto-submitting with answers:", answers);
      alert("⏳ Time's up! Submitting your answers...");
      setQuizSubmitted(true); // Set this first to prevent multiple calls
      await handleSubmit(); // Call submit function
    }
  };



  // Prevent user from switching tabs or minimizing window
  const preventTabSwitch = useCallback(() => {
    if (document.hidden) {
      if (!quizSubmitted) {
        alert("🚫 You can't switch tabs or minimize the window during the quiz!");
        setQuizEnded(true); // End quiz if user switches tabs
      }
    }
  }, [quizSubmitted]);

  // Disable all keyboard events
  const disableKeyboard = (event) => {
    if (quizStarted && !quizEnded) {
      if (event.key === "Escape") {
        event.preventDefault(); // Prevent ESC exit
        setExitWarnings((prev) => prev + 1);

        if (exitWarnings >= 2) {
          alert("❌ You tried to exit full screen multiple times! The quiz is over.");
          setQuizEnded(true);
        } else {
          alert("⚠️ Warning: You cannot exit full screen during the quiz!");
          enableFullScreen(); // Force full screen again
        }
      } else {
        event.preventDefault(); // Block other key inputs
      }
    }
  };

  // Detect if user tries to minimize or switch tabs
  const handleBlur = () => {
    if (quizStarted && !quizEnded && !quizSubmitted) {
      alert("🚫 You minimized the window! The quiz is now over.");
      setQuizEnded(true);
    }
  };

  // Prevent right-click
  const preventContextMenu = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    socket.on("quizStarted", () => {
      enableFullScreen(); // Trigger fullscreen when quiz starts
      setQuizStarted(true);
    });

    // Fetch questions from the backend
    axios.get("https://quiz-app-so3y.onrender.com/api/questions").then((res) => {
      setQuestions(res.data);
    });

    document.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("keydown", disableKeyboard);
    document.addEventListener("visibilitychange", preventTabSwitch);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("keydown", disableKeyboard);
      document.removeEventListener("visibilitychange", preventTabSwitch);
      window.removeEventListener("blur", handleBlur);
      socket.off("quizStarted");
    };
  }, [quizStarted, quizEnded, preventTabSwitch, handleBlur, exitWarnings]);

  // Handle radio button answer selection (disabled if quiz ended)
  const handleAnswerChange = (questionId, selectedOption) => {
    if (!quizEnded) {
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        [questionId]: selectedOption
      }));

      console.log("✅ Answer Selected:", questionId, selectedOption); // Debug log
    }
  };


  // Handle quiz submission
  const handleSubmit = async () => {
    if (quizEnded || quizSubmitted) return; // Prevent multiple submissions

    let userId = localStorage.getItem("userId");
    if (!userId || userId.length !== 24) {
      alert("❌ Invalid User ID. Please log in again.");
      return;
    }

    // 🛠 Log collected answers before sending
    console.log("📝 Submitted Answers:", answers);

    // 🔥 Fix: Ensure at least one answer is selected
    const answeredQuestions = Object.values(answers).filter(ans => ans !== "").length;
    if (answeredQuestions === 0) {
      alert("❌ No answers selected! Please attempt at least one question.");
      return;
    }

    try {
      const response = await axios.post("https://quiz-app-so3y.onrender.com/api/quiz/submit", { userId, answers });

      console.log("✅ Server Response:", response.data);  // Log response

      if (response.data && response.data.success) {
        setQuizSubmitted(true);
        localStorage.setItem("quizAttempted", "true");
        document.exitFullscreen();
        window.location.href = "/leaderboard";
      } else {
        alert("⚠️ Something went wrong, quiz was not submitted!");
      }
    } catch (error) {
      console.error("❌ Quiz submission error:", error);

      if (error.response) {
        alert(`Server Error: ${error.response.data?.message || "Something went wrong!"}`);
      } else if (error.request) {
        alert("❌ No response from server. Check your internet connection.");
      } else {
        alert("❌ Something went wrong while submitting.");
      }
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
            autoSubmit(); // Ensure this is called when time reaches 0
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, quizEnded, quizSubmitted]); // Added quizSubmitted to dependencies


  // Format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 10-second delay before starting the quiz
  const handleStartQuiz = () => {
    setIsWaiting(true);
    enableFullScreen();

    setTimeout(() => {
      setIsWaiting(false);
      localStorage.setItem("quizStarted", "true");
    }, 10000); // 10 seconds delay
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
            cursor: isWaiting ? "not-allowed" : "pointer"
          }}
          onClick={handleStartQuiz}
          disabled={isWaiting}
        >
          {isWaiting ? "Please wait..." : "Start Quiz"}
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
                    <input type="radio" name={q._id} value={opt} checked={answers[q._id] === opt} onChange={() => handleAnswerChange(q._id, opt)} disabled={quizEnded} style={{ marginRight: "10px" }} />
                    <label style={{ color: "white" }}>{opt}</label>
                  </div>
                ))}
              </div>
            ))
          )}
          <button style={{ backgroundColor: quizEnded ? "gray" : "#39FF14", padding: "10px", width: "100%", marginTop: "20px", borderRadius: "5px" }} onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
