import "../styles/chat_message.css";
import { useState, FormEvent, useMemo, useEffect } from "react";
import { ChatRecord } from "../models/chat";
import socket from "../utils/socket";
import { useUserStore } from "../stores/userStore";
import { ChatMessageModel } from "../models/socket_model";

interface ChatMessagesProps {
  chat_name: string | null;
  chat: ChatRecord[] | null;
  roomId?: string; // 新增 roomId 屬性
}

interface MessageGroup {
  id: number | string;
  sender: string | number;
  senderName: string;
  messages: {
    id: number | string;
    text: string;
    time: string;
  }[];
}

const formatTime = (dateString: string | Date): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// 獲取用戶名稱首字母
const getInitials = (name: string): string => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const ChatMessages: React.FC<ChatMessagesProps> = ({
  chat_name,
  chat,
  roomId = "default-room", // 預設房間ID
}) => {
  const [newMessage, setNewMessage] = useState<string>(""); //
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const user = useUserStore((state) => state.user);

  // 發送訊息
  const sendMessage = (message: string) => {
    if (!user) return;

    const messageData = {
      roomId,
      sender: user.id,
      senderName: user.name || "匿名用戶",
      content: message,
    };

    // 發送到 WebSocket 服務器
    socket.emit("send_room_message", messageData);

    // 更新本地狀態
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        timestamp: new Date().toISOString(),
      },
    ]);

    setNewMessage("");
  };

  // 監聽新訊息
  useEffect(() => {
    // 加入房間
    if (user?.id && roomId) {
      socket.emit("join_room", roomId);
      socket.emit("login", { userId: user.id, roomId });
    }

    // 監聽房間訊息
    const handleNewMessage = (data: ChatMessageModel) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
        },
      ]);
    };

    socket.on("receive_room_message", handleNewMessage);

    // 清理函數
    return () => {
      socket.off("receive_room_message", handleNewMessage);
      if (roomId) {
        socket.emit("leave_room", roomId);
      }
      socket.disconnect();
    };
  }, [user, roomId]);

  const groupedMessages = useMemo(() => {
    // 合併歷史訊息和即時訊息
    const allMessages = [
      ...(chat?.map((c) => ({
        id: c.sort || Date.now(),
        sender: c.sender,
        senderName: c.user_name || "User",
        content: c.message,
        timestamp: new Date(c.create_date).toISOString(),
      })) || []),
      ...messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString(),
      })),
    ];

    // 按時間排序
    allMessages.sort(
      (a, b) =>
        new Date(a.timestamp || 0).getTime() -
        new Date(b.timestamp || 0).getTime()
    );

    // 分組邏輯
    const groups: MessageGroup[] = [];

    allMessages.forEach((message, index) => {
      // 訊息分群
      const prevMessage = allMessages[index - 1];
      const messageTime = message.timestamp
        ? new Date(message.timestamp).getTime()
        : 0;
      const prevMessageTime = prevMessage?.timestamp
        ? new Date(prevMessage.timestamp).getTime()
        : 0;
      const isNewGroup =
        index === 0 ||
        message.sender !== prevMessage?.sender ||
        messageTime - prevMessageTime > 30 * 60 * 1000;

      if (isNewGroup) {
        groups.push({
          id: message.id || `msg-${Date.now()}-${index}`,
          sender: message.sender,
          senderName: message.senderName || "User",
          messages: [],
        });
      }

      const currentGroup = groups[groups.length - 1];
      if (currentGroup) {
        currentGroup.messages.push({
          id: message.id || `msg-${Date.now()}-${index}`,
          text: message.content,
          time: formatTime(message.timestamp || new Date()),
        });
      }
    });

    return groups;
  }, [chat, messages]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
    }
  };

  if (!chat) {
    return (
      <div className="chatMessages">
        <h2>聊天室</h2>
        <div className="messageContainer">
          <div className="emptyState">請選擇一個聊天室開始對話</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatMessages">
      <h2>{chat_name || "聊天室"}</h2>
      <div className="messageContainer">
        {groupedMessages.length > 0 ? (
          groupedMessages.map((group, groupIndex) => {
            const isSent = group.sender === 1;
            const avatarInitial = getInitials(group.senderName);

            return (
              <div
                key={group.id || groupIndex}
                className={`messageWrapper ${isSent ? "sent" : "received"}`}
              >
                {!isSent && <div className="avatar">{avatarInitial}</div>}
                <div className="messageContent">
                  <div className="username">{group.senderName}</div>
                  <div className="messageBubble">
                    {group.messages.map((msg, msgIndex) => (
                      <div key={msg.id || msgIndex} className="singleMessage">
                        <div className="messageText">{msg.text}</div>
                        <span className="messageTime">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {isSent && <div className="avatar">{avatarInitial}</div>}
              </div>
            );
          })
        ) : (
          <div className="emptyState">沒有訊息</div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="inputForm">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="輸入訊息..."
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          aria-label="Send message"
          onClick={() => sendMessage(newMessage)}
        >
          送
        </button>
      </form>
    </div>
  );
};

export default ChatMessages;
