"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3000"); // 連接到後端伺服器

    socketRef.current.on("chat message", (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input) {
      console.log(input);
      socketRef.current?.emit("chat message", input);
      setInput("");
    }
  };

  return (
    <div>
      <h1>聊天室</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">送出</button>
      </form>
    </div>
  );
}
