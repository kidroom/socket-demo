// pages/index.tsx
import ChatList from "../components/chat_list";
import ChatMessages from "../components/chat_message";
import "../styles/chat.css";
import { useState } from "react";

interface Message {
  sender: "me" | "other" | string;
  text: string;
}

interface Chat {
  id: string;
  name: string;
  messages?: Message[];
}

const DUMMY_CHATS: Chat[] = [
  {
    id: "1",
    name: "小明",
    messages: [
      { sender: "me", text: "你好嗎？" },
      { sender: "other", text: "我很好，謝謝！" },
    ],
  },
  {
    id: "2",
    name: "群組聊天",
    messages: [
      { sender: "A", text: "大家早安！" },
      { sender: "B", text: "早安！" },
    ],
  },
  { id: "3", name: "技術交流", messages: [] },
];

const IndexPage: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (chatId: string) => {
    const chat = DUMMY_CHATS.find((c) => c.id === chatId);
    setSelectedChat(chat || null);
  };

  const getRoomList = async (e: React.FormEvent) => {
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
        setMessage(error.response?.data.message || "登入失敗");
      } else if (error instanceof Error) {
        setMessage(error.message || "登入失敗");
      } else {
        setMessage("Unknown error");
      }
    }
  };

  return (
    <div className="container">
      <ChatList chats={DUMMY_CHATS} onSelectChat={handleSelectChat} />
      <ChatMessages chat={selectedChat} />
    </div>
  );
};

export default IndexPage;
