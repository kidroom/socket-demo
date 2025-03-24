const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    console.log('Client connected');

    socket.on('message', message => {
        console.log(`Received: ${message}`);
        io.emit('message', `Server received: ${message}`); // 向所有客戶端廣播訊息
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('WebSocket server started on http://localhost:3000');
});