// Import React, useState, useEffect, useCallback
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://quiz-app-so3y.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

function Quiz() {
  const [adminStarted, setAdminStarted] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [exitWarnings, setExitWarnings] = useState(0);

  const enableFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log("Fullscreen Error:", err));
    }
  };

  const autoSubmit = async () => {
    if (!quizSubmitted) {
      setQuizSubmitted(true);
      await handleSubmit();
    }
  };

  const preventTabSwitch = useCallback(() => {
    if (document.hidden) {
      if (!quizSubmitted) {
        alert("🚫 You can't switch tabs or minimize the window during the quiz!");
        setQuizEnded(true);
      }
    }
  }, [quizSubmitted]);

  const disableKeyboard = (event) => {
    if (quizStarted && !quizEnded) {
      if (event.key === "Escape") {
        event.preventDefault();
        setExitWarnings(prev => prev + 1);
        if (exitWarnings >= 2) {
          alert("❌ You tried to exit full screen multiple times! The quiz is over.");
          setQuizEnded(true);
        } else {
          alert("⚠️ Warning: You cannot exit full screen during the quiz!");
          enableFullScreen();
        }
      } else {
        event.preventDefault();
      }
    }
  };

  useEffect(() => {
    socket.on("quizStarted", () => {
      enableFullScreen();
      setQuizStarted(true);
    });

    axios.get("https://quiz-app-so3y.onrender.com/api/questions").then(res => {
      setQuestions(res.data);
    });

    document.addEventListener("visibilitychange", preventTabSwitch);
    window.addEventListener("keydown", disableKeyboard);

    return () => {
      document.removeEventListener("visibilitychange", preventTabSwitch);
      window.removeEventListener("keydown", disableKeyboard);
      socket.off("quizStarted");
    };
  }, [quizStarted, quizEnded, preventTabSwitch, exitWarnings]);

  const handleAnswerChange = (questionId, selectedOption) => {
    if (!quizEnded) {
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        [questionId]: selectedOption,
      }));
    }
  };

  const handleSubmit = async () => {
    if (quizEnded || quizSubmitted) return;
    let userId = localStorage.getItem("userId");
    if (!userId || userId.length !== 24) {
      alert("❌ Invalid User ID. Please log in again.");
      return;
    }
    try {
      const response = await axios.post("https://quiz-app-so3y.onrender.com/api/quiz/submit", { userId, answers });
      if (response.data?.success) {
        setQuizSubmitted(true);
        localStorage.setItem("quizAttempted", "true");
        window.location.href = "/leaderboard";
      } else {
        alert("⚠️ Something went wrong, quiz was not submitted!");
      }
    } catch (error) {
      alert("❌ Submission error. Try again!");
    }
  };

  useEffect(() => {
    let interval;
    if (quizStarted && !quizEnded) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            autoSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizEnded]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Quiz</h2>
      <div>Time Remaining: {timeRemaining}s</div>
      {questions.map((q, idx) => (
        <div key={q._id}>
          <h3>{idx + 1}. {q.question}</h3>
          {q.options.map((opt, i) => (
            <label key={i}>
              <input
                type="radio"
                name={q._id}
                value={opt}
                checked={answers[q._id] === opt}
                onChange={() => handleAnswerChange(q._id, opt)}
                disabled={quizEnded}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={quizSubmitted}>Submit</button>
    </div>
  );
}

export default Quiz;
