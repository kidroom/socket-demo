const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const onlineUsers = new Map();

// CORS 設定
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

// 儲存房間和用戶的對應關係
const roomUsers = new Map();

io.on('connection', socket => {
    console.log("用戶連線成功:", socket.id);

    // 用戶登入
    socket.on("login", ({ userId, roomId }) => {
        onlineUsers.set(userId, socket.id);

        // 加入房間
        if (roomId) {
            socket.join(roomId);
            roomUsers.set(userId, roomId);
            console.log(`用戶 ${userId} 加入了房間 ${roomId}`);
        }
    });

    // 發送訊息到房間
    socket.on("send_room_message", ({ roomId, sender, senderId, senderName, receive, sort, content, timestamp }) => {
        console.log(`收到來自房間 ${roomId} 的訊息: ${content}`);
        io.to(roomId).emit("receive_room_message", {
            sender,
            senderId,
            senderName,
            receive,
            sort,
            content,
            timestamp,
        });
    });

    // 加入房間
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`用戶 ${socket.id} 加入了房間 ${roomId}`);
    });

    // 離開房間
    socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`用戶 ${socket.id} 離開了房間 ${roomId}`);
    });

    // 斷開連接
    socket.on("disconnect", () => {
        console.log("用戶離線:", socket.id);
        // 從在線用戶中移除
        for (const [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                const roomId = roomUsers.get(key);
                if (roomId) {
                    socket.leave(roomId);
                    roomUsers.delete(key);
                }
                onlineUsers.delete(key);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO 服務器運行在 http://localhost:${PORT}`);
});