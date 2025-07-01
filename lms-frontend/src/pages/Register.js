import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("Registered successfully! You can now log in.");
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.left}>
          <img
            src="/images/courses/login.jpg"
            alt="Register Illustration"
            style={styles.image}
          />
        </div>

        <div style={styles.right}>
          <h2 style={styles.heading}>Create Account</h2>
          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            {/* Radio buttons instead of dropdown */}
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.radioInput}
                />
                Student
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="teacher"
                  checked={role === "teacher"}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.radioInput}
                />
                Teacher
              </label>
            </div>

            <button type="submit" style={styles.button}>
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    display: "flex",
    maxWidth: "900px",
    width: "100%",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    borderRadius: "15px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  left: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  right: {
    flex: 1,
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  heading: {
    fontSize: "26px",
    fontWeight: "600",
    marginBottom: "25px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  input: {
    padding: "12px 15px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    transition: "0.3s",
    outline: "none",
  },
  radioGroup: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  radioInput: {
    accentColor: "#000",
    transform: "scale(1.2)",
    cursor: "pointer",
  },
  button: {
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "600",
    fontSize: "16px",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};
