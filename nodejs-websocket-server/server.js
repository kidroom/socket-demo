const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const onlineUsers = new Map();
//CROS setting
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001", // 允許的前端來源
        methods: ["GET", "POST"],        // 允許的請求方法
        allowedHeaders: ["Content-Type"], // 允許的標頭
        credentials: true, // 允許攜帶 cookies 或身份驗證資訊
    },
});

io.on('connection', socket => {
    console.log("連線成功:", socket.id);

    socket.on("login", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send_message", ({ sender, receive, content }) => {
        console.log(`成功取得${sender}訊息:${content}`)
        const targetSocketId = onlineUsers.get(receive);
        if (targetSocketId) {
            socket.to(targetSocketId).emit("receive_message", { sender: sender, receive: receive, content: content });
            console.log(`成功取推播${targetSocketId}的訊息:${content}`)
        }
    });

    socket.on("disconnect", () => {
        console.log("使用者離線:", socket.id);
        for (const [key, value] of onlineUsers.entries()) {
            if (value === socket.id) onlineUsers.delete(key);
        }
    });
});

server.listen(3000, () => {
    console.log('socket io server started on http://localhost:3000');
});