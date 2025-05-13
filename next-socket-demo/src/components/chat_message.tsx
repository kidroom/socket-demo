// components/ChatMessages.tsx
import "../styles/chat_message.css";
import { useState, FormEvent } from "react";

interface Message {
  sender: "me" | "other" | string;
  text: string;
}

interface Chat {
  id: string;
  name: string;
  messages?: Message[];
}

interface ChatMessagesProps {
  chat: Chat | null;
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
      <h2>{chat?.name}</h2>
      <div className="messageContainer">
        {chat.messages?.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "me" ? "sent" : "received"}
          >
            {msg.text}
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
