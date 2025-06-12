import dotenv from "dotenv";
import express, { Express, Request, Response } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

// Load environment variables
dotenv.config({ path: "../.env" });

// Initialize Express app
const app: Express = express();
const server: HttpServer = createServer(app);

// CORS configuration
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Data structures for tracking users and rooms
const onlineUsers: Map<string, string> = new Map(); // userId -> socketId
const roomUsers: Map<string, string> = new Map();   // userId -> roomId

// Socket.IO connection handler
io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // User login handler
    socket.on("login", (data: { userId: string; roomId: string }) => {
        const { userId, roomId } = data;
        onlineUsers.set(userId, socket.id);

        // Join room if roomId is provided
        if (roomId) {
            socket.join(roomId);
            roomUsers.set(userId, roomId);
        }
        console.log(`User ${userId} logged in with socket ${socket.id}`);
    });

    // Handle sending messages to room
    socket.on("send_room_message", (data: {
        roomId: string;
        sender: boolean;
        senderId: string;
        senderName: string;
        receive: string;
        sort: number;
        content: string;
        timestamp: string;
    }) => {
        const { roomId, sender, senderId, senderName, receive, sort, content, timestamp } = data;
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

    // Handle joining a room
    socket.on("join_room", (roomId: string) => {
        socket.join(roomId);
        console.log(`用戶 ${socket.id} 加入了房間 ${roomId}`);
    });

    // Handle leaving a room
    socket.on("leave_room", (roomId: string) => {
        socket.leave(roomId);
        console.log(`用戶 ${socket.id} 離開了房間 ${roomId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("用戶離線:", socket.id);
        // Remove user from online users and rooms
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

// Start the server
const PORT: number = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, () => {
    console.log(`Socket.IO 服務器運行在 http://localhost:${PORT}`);
});

export default server;
