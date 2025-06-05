// pages/index.tsx
import ChatList from "../components/chat_list";
import ChatMessages from "../components/chat_message";
import "../styles/chat.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { RoomList, ChatRecord } from "../models/chat";

async function getChatRecordAsync(
  room_id: string
): Promise<ChatRecord[] | null> {
  try {
    const response = await axios.post(
      "http://localhost:5010/api/chat/get_chat_record",
      { room_id }, // JSON body
      {
        withCredentials: true, // 傳送 cookie
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const records = response.data;

    return records;
  } catch (error) {
    console.log(error);
  }
  return null;
}

const IndexPage: React.FC = () => {
  const [roomList, setRoomList] = useState<RoomList[] | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatRecord[] | null>(null);

  useEffect(() => {
    const getRoomListAsync = async (): Promise<RoomList[] | null> => {
      try {
        const response = await axios.get(
          "http://localhost:5010/api/chat/get_room_list",
          {
            withCredentials: true, // 傳送 cookie
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const rooms = response.data;
        setRoomList(rooms);
        console.log(`取得房間列表成功${rooms}`);
        return rooms;
      } catch (error) {
        console.log(error);
      }
      return null;
    };
    console.log(document.cookie);
    getRoomListAsync();
  }, []);

  const handleSelectChat = async (chatId: string) => {
    const chat = roomList?.find((c) => c.room_id === chatId);
    if (!chat) {
      console.log("取得選取得聊天室失敗");
      return;
    }
    console.log(`點擊聊天室成功${chat}`);
    const record = await getChatRecordAsync(chat.room_id);
    console.log(`取得聊天內容成功${chat}`);
    setSelectedChatName(chat.room_name || null);
    setSelectedChat(record || null);
  };

  return (
    <div className="container">
      <ChatList chats={roomList} onSelectChat={handleSelectChat} />
      <ChatMessages chat_name={selectedChatName} chat={selectedChat} />
    </div>
  );
};

export default IndexPage;
