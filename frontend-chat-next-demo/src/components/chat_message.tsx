import "../styles/chat_message.css";
import { useState, FormEvent, useMemo, useEffect, useRef } from "react";
import { ChatRecord } from "../models/chat_model";
import socket from "../utils/socket";
import { useUserStore } from "../stores/userStore";
import { ChatMessageModel } from "../models/socket_model";

interface ChatMessagesProps {
  chat_name: string | null;
  chat: ChatRecord[] | null;
  roomId: string;
}

// 定義單個訊息的類型
interface MessageItem {
  text: string;
  time: string;
  timestamp: Date;
  isFirstInGroup?: boolean;
}

// 定義發送者群組的類型
interface SenderGroup {
  sender: boolean;
  senderId: string;
  senderName: string;
  messages: MessageItem[];
}

// 定義日期分組的類型
interface DateGroup {
  date: string;
  messages: SenderGroup[];
}

// 格式化時間 (HH:MM)
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// 格式化日期 (YYYY/MM/DD)
const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return '今天';
  if (isYesterday) return '昨天';
  
  // 檢查是否為今年
  if (date.getFullYear() === today.getFullYear()) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }
  
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};

// 獲取用戶名稱首字母
const getInitials = (name: string): string => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const ChatMessages: React.FC<ChatMessagesProps> = ({
  chat_name,
  chat,
  roomId,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useUserStore((state) => state.user);
  const scrollPositionRef = useRef(0);

  // 發送訊息
  const sendMessage = (message: string) => {
    if (!user) return;

    const messageData = {
      roomId,
      sender: true,
      senderId: user.id,
      senderName: user.name,
      receive: roomId,
      sort: messages.length > 0 ? messages[messages.length - 1].sort + 1 : 1,
      content: message,
      timestamp: new Date().toISOString(),
    };

    // 發送到 WebSocket 服務器
    socket.emit("send_room_message", messageData);

    setNewMessage("");
  };

  // 滾動到底部
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 處理滾動事件
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 50;
    
    setShowScrollToBottom(!isAtBottom);
    scrollPositionRef.current = scrollTop;
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
      setMessages((prev) => {
        const newMessages = [
          ...prev,
          {
            ...data,
          },
        ];
        
        // 如果滾動條在底部或接近底部，自動滾動
        const container = containerRef.current;
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 100;
          
          if (isAtBottom) {
            setTimeout(() => scrollToBottom('smooth'), 100);
          }
        }
        
        return newMessages;
      });
    };

    socket.on("receive_room_message", handleNewMessage);

    // 設定聊天訊息
    const initialMessages = chat?.map((c) => ({
      roomId: c.room_id,
      sender: c.sender,
      senderId: c.user_id,
      senderName: c.user_name,
      receive: c.room_id,
      content: c.message,
      sort: c.sort,
      timestamp: new Date(c.create_date).toISOString(),
    })) || [];
    
    setMessages(initialMessages);
    
    // 初始載入時滾動到底部
    setTimeout(() => scrollToBottom('instant'), 100);

    // 清理函數
    return () => {
      socket.off("receive_room_message", handleNewMessage);
      if (roomId) {
        socket.emit("leave_room", roomId);
      }
    };
  }, [user, roomId]);

  const groupedMessages = useMemo(() => {
    // 合併歷史訊息和即時訊息
    const allMessages = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    // 按時間排序 (從舊到新)
    allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // 按日期分組
    const dateGroups: DateGroup[] = [];
    let currentDateGroup: DateGroup | null = null;
    let currentSenderGroup: SenderGroup | null = null;

    allMessages.forEach((message, index) => {
      const messageDate = formatDate(message.timestamp);
      const messageTime = formatTime(message.timestamp);
      const isSent = message.senderId === user?.id;
      const senderName = message.senderName || (isSent ? '你' : '對方');

      // 檢查是否需要創建新的日期分組
      if (!currentDateGroup || currentDateGroup.date !== messageDate) {
        currentDateGroup = {
          date: messageDate,
          messages: []
        };
        dateGroups.push(currentDateGroup);
        currentSenderGroup = null;
      }

      // 檢查是否需要創建新的發送者分組
      const isNewSenderGroup = !currentSenderGroup || 
        currentSenderGroup.senderId !== message.senderId ||
        (index > 0 && 
         (message.timestamp.getTime() - new Date(allMessages[index - 1].timestamp).getTime()) > 30 * 60 * 1000);

      if (isNewSenderGroup) {
        currentSenderGroup = {
          sender: isSent,
          senderId: message.senderId,
          senderName: senderName,
          messages: []
        };
        currentDateGroup.messages.push(currentSenderGroup);
      }

      // 添加訊息到當前發送者分組
      if (currentSenderGroup) {
        currentSenderGroup.messages.push({
          text: message.content,
          time: messageTime,
          timestamp: message.timestamp,
          isFirstInGroup: isNewSenderGroup
        });
      }
    });

    return dateGroups;
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

  // 當訊息變化時檢查是否需要滾動
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      
      if (isAtBottom) {
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    }
  }, [messages]);

  return (
    <div className="chatMessages">
      <h2>{chat_name || "聊天室"}</h2>
      <div 
        className="messageContainer" 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ position: 'relative' }}
      >
        {showScrollToBottom && (
          <button 
            className="scrollToBottomButton"
            onClick={() => scrollToBottom('smooth')}
            title="跳至底部"
          >
            ↓
          </button>
        )}
        {groupedMessages.length > 0 ? (
          groupedMessages.map((dateGroup, dateIndex) => (
            <div key={`date-${dateIndex}`} className="dateGroup">
              <div className="dateDivider">
                <span>{dateGroup.date}</span>
              </div>
              {dateGroup.messages.map((senderGroup, groupIndex) => {
                const isSent = senderGroup.sender;
                const avatarInitial = getInitials(senderGroup.senderName);

                return (
                  <div
                    key={`${dateIndex}-${groupIndex}`}
                    className={`messageWrapper ${isSent ? "sent" : "received"}`}
                  >
                    {!isSent && <div className="avatar">{avatarInitial}</div>}
                    <div className="messageContent">
                      <div className="username">{senderGroup.senderName}</div>
                      <div className="messageBubble">
                        {senderGroup.messages.map((msg, msgIndex) => (
                          <div 
                            key={`${dateIndex}-${groupIndex}-${msgIndex}`} 
                            className={`singleMessage ${msg.isFirstInGroup ? 'first-in-group' : ''}`}
                          >
                            <div className="messageText">{msg.text}</div>
                            <span className="messageTime">{msg.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {isSent && <div className="avatar">{avatarInitial}</div>}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="emptyState">沒有訊息</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {roomId && (
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
      )}
    </div>
  );
};

export default ChatMessages;
