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
      const res = await axios.post("https://quiz-app-so3y.onrender.com/api/auth/login", { email, password });

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
    
    <div className="container">
      <form onSubmit={handleLogin} className="form">
        <div className="form_front">
          <div className="form_details">Hack A Way</div>
          <input type="text" className="input" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <input type="text" className="input" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button className="btn">Login</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
