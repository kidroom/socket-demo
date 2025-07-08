import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "../services/api/authService";
import { useUserStore } from "../stores/userStore";
import "../styles/login.css";
import { AxiosError } from "axios";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const { login } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await authService.login({
        account,
        password,
      });
      login(response.user, response.token);

      router.push("/chat");
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.message || "登入失敗");
      } else if (error instanceof Error) {
        setMessage(error.message || "登入失敗");
      } else {
        setMessage("登入時發生未知錯誤");
      }
    } finally {
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <h2>Login</h2>
        {message && (
          <p
            className={`message ${
              message.includes("成功") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="account">User Name:</label>
            <input
              type="text"
              placeholder="account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-button" type="submit">
            Login
          </button>
        </form>
        <p className="register-link">
          還沒有帳號？
          <Link href="/chat_register">Register</Link>
        </p>
      </div>
    </div>
  );
}
