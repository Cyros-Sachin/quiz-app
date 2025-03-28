import React, { useEffect, useState } from "react";
import axios from "axios";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/quiz/leaderboard")
      .then((res) => {
        setLeaderboard(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch leaderboard. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-darkBg">
      <h1 className="text-neon text-3xl mb-4">🏆 Leaderboard</h1>

      {loading ? (
        <div className="text-neon">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="w-3/4 md:w-1/2 bg-gray-900 p-4 rounded-lg shadow-xl">
          <thead>
            <tr>
              <th className="text-left text-neon">Rank</th>
              <th className="text-left text-neon">Name</th>
              <th className="text-left text-neon">Score</th>
              <th className="text-left text-neon">Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={index} className="hover:bg-gray-700 transition-colors">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{user.userId.name}</td>
                <td className="p-2">{user.score}</td>
                <td className="p-2">{new Date(user.submittedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
