import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/services/api";
import { AxiosError } from "axios";
import "../styles/register.css";

const RegisterPage = () => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await authService.register({
        account,
        password,
      });
      
      setMessage(response.message);
      // Redirect to login page after successful registration
      if (response.message.includes("成功")) {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.message || "註冊失敗");
      } else if (error instanceof Error) {
        setMessage(error.message || "註冊失敗");
      } else {
        setMessage("註冊時發生未知錯誤");
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
            <label htmlFor="account">User Name:</label>
            <input
              type="text"
              id="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
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
