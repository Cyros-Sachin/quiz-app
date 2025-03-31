import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
const socket = io("http://13.203.101.148:5000", {
  transports: ["websocket"], // Force WebSocket connection (no polling)
  withCredentials: true, // If you need credentials (cookies, etc.)
});
function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch initial leaderboard data
    axios
      .get("http://13.203.101.148:5000/api/quiz/leaderboard")
      .then((res) => {
        setLeaderboard(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch leaderboard. Please try again.");
        setLoading(false);
      });

    // Listen for leaderboard updates via socket.io
    socket.on("leaderboardUpdated", (updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);  // Update leaderboard state
    });

    // Clean up socket listener on component unmount
    return () => {
      socket.off("leaderboardUpdated");
    };
  }, []);

  return (
    <div className="leader-container">
      <div class="trophy">🏆</div>
      <h1 className="leader-text">Leaderboard</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.userId?.name || "Anonymous"}</td>
                <td>{user.score}</td>
                <td>{new Date(user.submittedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
