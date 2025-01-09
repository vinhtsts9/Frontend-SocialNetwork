import React, { useState } from 'react';

const WebSocketClient = () => {
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');
    const [roomId, setRoomId] = useState('');
    const [message, setMessage] = useState('');
    const [action, setAction] = useState('join');
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    const addMessage = (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
    };

    const connectWebSocket = () => {
        if (!token) {
            addMessage('Token is required to connect!');
            return;
        }

        const ws = new WebSocket('ws://localhost:8080/ws');

        ws.onopen = () => {
            console.log('WebSocket connected!');
            setIsConnected(true);
            addMessage('Connected to WebSocket server.');

            const data = { action: "auth", token: `Bearer ${token}` };
            ws.send(JSON.stringify(data));
            addMessage(`You: ${JSON.stringify(data)}`);

            setSocket(ws);
        };

        ws.onmessage = (event) => {
            console.log("Received from server: ", event.data);
            addMessage('Server: ' + event.data);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected!');
            setIsConnected(false);
            addMessage('Disconnected from WebSocket server.');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            addMessage('WebSocket error. Check console for details.');
        };
    };

    const handleSend = () => {
        if (!roomId || !action) {
            addMessage('Room ID and Action are required!');
            return;
        }

        const messageContent = {
            action: action,
            room_id: parseInt(roomId, 10),
            message: message,
        };

        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("Sending message: ", messageContent);
            socket.send(JSON.stringify(messageContent));
            addMessage('You: ' + JSON.stringify(messageContent));
        } else {
            addMessage('WebSocket is not connected or is not ready.');
        }
    };

    return (
        <div className="container">
            <h2>WebSocket Client</h2>

            <label htmlFor="token">Token:</label>
            <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter Token"
            />

            <label htmlFor="room_id">Room ID:</label>
            <input
                type="number"
                id="room_id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
            />

            <label htmlFor="action">Action:</label>
            <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
            >
                <option value="join">Join</option>
                <option value="send_message">Send Message</option>
                <option value="leave">Leave</option>
            </select>

            <label htmlFor="message">Message (optional):</label>
            <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
            ></textarea>

            <button onClick={connectWebSocket}>Connect to WebSocket</button>
            <button onClick={handleSend} disabled={!isConnected}>
                Send
            </button>

            <h3>Messages:</h3>
            <div id="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        {msg}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebSocketClient;
