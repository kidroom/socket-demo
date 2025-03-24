import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:3001'); // 連接到後端伺服器

        socketRef.current.on('chat message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input) {
            socketRef.current.emit('chat message', input);
            setInput('');
        }
    };

    return (
        <div>
            <h1>聊天室</h1>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit">送出</button>
            </form>
        </div>
    );
}