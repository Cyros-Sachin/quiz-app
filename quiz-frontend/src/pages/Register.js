import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { name, email, password, role: "student" });
      navigate("/");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#2D2D2D" }}>
      <h1 style={{ color: "#39FF14", fontSize: "30px", marginBottom: "20px" }}>Register</h1>
      <form onSubmit={handleRegister} style={{ backgroundColor: "#1A1A1A", padding: "30px", borderRadius: "8px", width: "300px" }}>
        <input
          type="text"
          className="input"
          style={{ padding: "10px", marginBottom: "15px", width: "100%", borderRadius: "5px" }}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="input"
          style={{ padding: "10px", marginBottom: "15px", width: "100%", borderRadius: "5px" }}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="input"
          style={{ padding: "10px", marginBottom: "15px", width: "100%", borderRadius: "5px" }}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          style={{
            backgroundColor: "#39FF14",
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
