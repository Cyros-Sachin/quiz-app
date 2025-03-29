import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://backend-quiz-psi.vercel.app/api/auth/login", { email, password });
  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);  // ✅ Ensure correct userId is stored
      localStorage.setItem("role", res.data.role);
  
      console.log("Logged in User ID:", res.data.userId); // Debugging log
  
      res.data.role === "admin" ? navigate("/dashboard") : navigate("/quiz");
    } catch (err) {
      alert("Invalid credentials!");
    }
  };
  


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="bg-white/30 backdrop-blur-lg p-8 rounded-lg w-96 shadow-xl border border-white/20">
        <h1 className="text-white text-3xl text-center mb-6 font-bold">Quiz Portal</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              className="w-full p-4 rounded-md bg-transparent text-white border border-white/30 focus:border-white"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full p-4 rounded-md bg-transparent text-white border border-white/30 focus:border-white"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full p-4 bg-neon text-white rounded-md hover:bg-neon-hover focus:outline-none transition-all"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
