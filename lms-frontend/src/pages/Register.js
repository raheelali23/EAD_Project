import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE } from "../config";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/;

  // Live validation with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors = {};

      if (password && !passwordRegex.test(password)) {
        newErrors.password =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
      }

      if (
        confirmPassword &&
        touched.confirmPassword &&
        password !== confirmPassword
      ) {
        newErrors.confirmPassword = "Passwords do not match.";
      }

      setErrors(newErrors);
    }, 300);

    return () => clearTimeout(timer);
  }, [password, confirmPassword, touched]);

  const validateFields = () => {
    const currentErrors = {};
    if (!passwordRegex.test(password)) {
      currentErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
    }
    if (password !== confirmPassword) {
      currentErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

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
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          style={styles.left}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <img
            src="/images/courses/register.png"
            alt="Register Illustration"
            style={styles.image}
          />
        </motion.div>

        <motion.div style={styles.right}>
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

            {/* Password Field */}
            <div style={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                style={{
                  ...styles.input,
                  borderColor: errors.password ? "red" : "#ccc",
                  paddingRight: "40px",
                }}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={styles.eyeIcon}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {touched.password && errors.password && (
              <div style={styles.error}>{errors.password}</div>
            )}

            {/* Confirm Password Field */}
            <div style={styles.passwordField}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, confirmPassword: true }))
                }
                style={{
                  ...styles.input,
                  borderColor:
                    touched.confirmPassword && errors.confirmPassword
                      ? "red"
                      : "#ccc",
                  paddingRight: "40px",
                }}
              />
              <span
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div style={styles.error}>{errors.confirmPassword}</div>
            )}

            {/* Role Radio Buttons */}
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

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={styles.button}
            >
              Register
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 💅 Styles
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#363535",
    padding: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    maxWidth: "900px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    borderRadius: "15px",
    overflow: "hidden",
    backgroundColor: "#fff",
    flexWrap: "wrap",
  },
  left: {
    flex: "1 1 300px",
    minHeight: "300px",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  right: {
    flex: "1 1 400px",
    padding: "40px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
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
    width: "100%",
  },
  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "-15px",
    marginBottom: "-5px",
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
  passwordField: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    cursor: "pointer",
    color: "#aaa",
    pointerEvents: "auto",
    backgroundColor: "#fff",
    padding: "2px",
  },
};
