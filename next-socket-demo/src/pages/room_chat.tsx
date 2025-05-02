"use client";

import { useState, useEffect } from "react";
import socket from "../lib/socket";
import { ChatMessageModel } from "../models/socket_model";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [input, setInput] = useState<string>("");
  const userId = "user_123"; // 假設登入使用者

  useEffect(() => {
    socket.connect();

    socket.emit("login", userId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [
        ...prev,
        { sender: "user_456", receive: userId, content: msg },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    socket.emit("send_message", {
      sender: userId,
      receive: "user_456",
      content: input,
    });
    setMessages((prev) => [
      ...prev,
      { sender: "我", receive: "user_456", content: input },
    ]);
    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>聊天室</h2>
      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "scroll",
          marginBottom: 10,
          padding: 10,
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="輸入訊息"
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: 10 }}>
        發送
      </button>
    </div>
  );
}
