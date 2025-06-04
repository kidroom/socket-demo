// components/ChatList.tsx
import "../styles/chat_list.css";
import { useState } from "react";
import { RoomList } from "../models/chat";

interface ChatListProps {
  chats: RoomList[] | null;
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
        {chats?.map((chat) => (
          <li
            key={chat.room_id}
            className={chat.room_id === activeChat ? "active" : ""}
            onClick={() => handleChatClick(chat.room_id)}
          >
            {chat.room_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
