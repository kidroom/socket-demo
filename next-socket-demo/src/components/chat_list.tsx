// components/ChatList.tsx
import "../styles/chat_list.css";
import { useState } from "react";

interface Chat {
  id: string;
  name: string;
}

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const handleChatClick = (chatId: string) => {
    setActiveChat(chatId);
    onSelectChat(chatId);
  };

  return (
    <div className="chatList">
      <h2>聊天列表</h2>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={chat.id === activeChat ? "active" : ""}
            onClick={() => handleChatClick(chat.id)}
          >
            {chat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
