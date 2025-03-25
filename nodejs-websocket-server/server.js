const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");

const app = express();
const server = http.createServer(app);
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
    console.log('Client connected');

    socket.on('chat message', message => {
        console.log(`Received: ${message}`);
        io.emit('chat message', `Server received: ${message}`); // 向所有客戶端廣播訊息
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('socket io server started on http://localhost:3000');
});