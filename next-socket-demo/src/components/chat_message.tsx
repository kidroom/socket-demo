// components/ChatMessages.tsx
import "../styles/chat_message.css";
import { useState, FormEvent } from "react";
import { ChatRecord } from "../models/chat";

interface Message {
  sender: "me" | "other" | string;
  text: string;
}

interface ChatMessagesProps {
  chat_name: string | null;
  chat: ChatRecord[] | null;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chat }) => {
  const [newMessage, setNewMessage] = useState<string>("");

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (newMessage.trim()) {
      // 在這裡處理發送訊息的邏輯 (例如：透過 Socket.IO)
      console.log("發送訊息:", newMessage);
      setNewMessage("");
    }
  };

  if (!chat) {
    return <div className="chatMessages">請選擇一個聊天室開始對話。</div>;
  }

  return (
    <div className="chatMessages">
      <h2>{chat_name}</h2>
      <div className="messageContainer">
        {chat?.map((msg, index) => (
          <div key={index} className={msg.sender === 1 ? "sent" : "received"}>
            {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="inputForm">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="輸入訊息..."
        />
        <button type="submit">送出</button>
      </form>
    </div>
  );
};

export default ChatMessages;
