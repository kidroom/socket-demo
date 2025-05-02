import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "../styles/register.css";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username,
        password,
      });
      setMessage(response.data.message);
      if (response.status === 201) {
        router.push("/login");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message || "註冊失敗");
      } else {
        setMessage("Unknown error");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="card">
        <h2>Register</h2>
        {message && (
          <p
            className={`message ${
              message.includes("成功") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
        <form className="register-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="username">User Name:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="register-button" type="submit">
            Register
          </button>
        </form>
        <p className="login-link">
          已經有帳號了？ <Link href="/chat_login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
import Link from "next/link";
