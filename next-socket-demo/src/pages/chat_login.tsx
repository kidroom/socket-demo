import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/login.css";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login with:", account, password);

    try {
      const response = await axios.post(
        "http://localhost:5010/api/user/login",
        {
          account,
          password,
        }
      );
      const { token } = response.data;
      // 將 token 儲存到 localStorage 或 cookie 中
      localStorage.setItem("authToken", token);
      router.push("/chat");
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data || "登入失敗");
      } else if (error instanceof Error) {
        setMessage(error.message || "登入失敗");
      } else {
        setMessage("Unknown error");
      }
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
