import { useState, useEffect } from "react";
import ChatList from "../components/chat_list";
import "../styles/chat.css";
import { chatService } from "../services/api/chatService";
import { RoomList, ChatRecord } from "../models/chat";
import { ChatMessage } from "../services/api/chatService";
import ChatMessages from "../components/chat_message";
import socket from "@/utils/socket";

const ChatPage: React.FC = () => {
  const [roomList, setRoomList] = useState<RoomList[]>([]);
  const [selectedChatName, setSelectedChatName] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<ChatRecord[]>([]);

  // Format chat records to match the expected format
  const formatChatRecords = (messages: ChatMessage[]): ChatRecord[] => {
    return messages.map((msg) => ({
      ...msg,
      user_id: msg.user_id,
      user_name: msg.user_name,
      room_id: msg.room_id,
      sort: msg.sort,
      sender: msg.sender,
      message: msg.message,
      createDate: msg.create_date,
    }));
  };

  // Fetch room list on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await chatService.getRoomList();
        console.log(
          `[ChatService] Successfully fetched ${JSON.stringify(response)} `
        );
        // Transform the room data to match the expected format
        const formattedRooms: RoomList[] = response.rooms.map((room) => ({
          ...room,
          room_id: room.room_id,
          room_name: room.room_name,
        }));
        setRoomList(formattedRooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectChat = async (chatId: string) => {
    const room = roomList.find((c) => c.room_id === chatId);
    if (!room) {
      return;
    }

    try {
      const response = await chatService.getChatRecords(chatId);
      const formattedRecords = formatChatRecords(response.messages);
      setSelectedChatName(room.room_name);
      setSelectedChat(formattedRecords);
    } catch (err) {
      console.error("Failed to fetch chat records:", err);
    }
  };

  return (
    <div className="container">
      <ChatList chats={roomList} onSelectChat={handleSelectChat} />
      <ChatMessages chat_name={selectedChatName} chat={selectedChat} />
    </div>
  );
};

export default ChatPage;
