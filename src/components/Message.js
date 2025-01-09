import React, { useState, useEffect, useRef } from 'react';
import '../styles/Message.css';
import { getCookie } from '../utils/cookie';

const Message = () => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const fetchingRef = useRef(false);
    const [userNickName, setUserNickName] = useState('');
    const [members, setMembers] = useState([]);
    const [showMembers, setShowMembers] = useState(false);

    const user = getCookie("token");

    const fetchChats = async () => {
        if (fetchingRef.current || !user) return;

        try {
            fetchingRef.current = true;
            const response = await fetch("http://localhost:8080/v1/2024/chat/get_room_by_userId", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user}`
                }
            });
            const data = await response.json();
            setChats(data.data || []);
        } catch (error) {
            console.error("Error fetching chats:", error);
        } finally {
            fetchingRef.current = false;
            setLoading(false);
        }
    };

    const fetchUserNickName = async () => {
        try {
            const response = await fetch("http://localhost:8080/v1/2024/chat/get_user_nickname", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user}`
                }
            });
            const data = await response.json();
            console.log("set user ni")
            setUserNickName(data.data.user_nickname || '');
        } catch (error) {
            console.error("Error fetching user nickname:", error);
        }
    };

    const createWebSocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('WebSocket connection already exists');
            return;
        }

        if (wsRef.current) {
            console.log('Closing existing WebSocket connection');
            wsRef.current.close(1000, "Closing previous connection");
            wsRef.current = null;
        }

        const websocket = new WebSocket('ws://localhost:8080/ws');

        websocket.onopen = () => {
            console.log('Connected to WebSocket');
            if (user && user) {
                websocket.send(JSON.stringify({
                    action: 'auth',
                    token: `Bearer ${user}`
                }));
            }
        };

        websocket.onmessage = (event) => {
            // Xử lý ping từ server
            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    const data = reader.result;
                    if (data === 'ping') {
                        websocket.send('pong');
                    }
                };
                reader.readAsText(event.data);
                return;
            }

            // Xử lý authentication success
            if (event.data === "Authentication successfully") {
                console.log('Authentication successful');
                fetchChats();
                return;
            }

            // Xử lý tin nhắn thông thường
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                
                if (data.message_context && data.message_type) {
                    const newMessage = {
                        sender: data.user_nickname,
                        message: data.message_context.String || '',
                        type_message: data.message_type,
                        createdAt: data.created_at?.Time || new Date().toISOString(),
                        isPinned: data.is_pinned?.Bool || false
                    };
                    setMessages(prevMessages => [...prevMessages, newMessage]);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            wsRef.current = null;

            if (event.code === 1006) {
                console.log('Abnormal closure, attempting to reconnect...');
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                reconnectTimeoutRef.current = setTimeout(createWebSocket, 1000);
            }
        };

        wsRef.current = websocket;

    };

    useEffect(() => {
        let isComponentMounted = true;

        const cleanup = () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                try {
                    wsRef.current.close(1000, 'Normal closure');
                } catch (error) {
                    console.error('Error closing WebSocket:', error);
                }
                wsRef.current = null;
            }
        };

        if (isComponentMounted) {
            cleanup();
            createWebSocket();
        }

        return () => {
            isComponentMounted = false;
            cleanup();
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && currentRoom && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const data = {
                action: 'send_message',
                room_id: currentRoom,
                message: messageInput,
                message_type: "text"    
            };
            wsRef.current.send(JSON.stringify(data));
            setMessageInput('');
        }
    };

    const joinRoom = (roomId) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action: 'join',
                room_id: roomId
            }));
            setCurrentRoom(roomId);
            
            fetch(`http://localhost:8080/v1/2024/chat/get_history/${roomId}`, {
                headers: {
                    "Authorization": `Bearer ${user}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    const formattedMessages = data.data.map(msg => ({
                        sender: msg.user_nickname,
                        message: msg.message_context.String || '',
                        type_message: msg.message_type,
                        createdAt: msg.created_at.Time || '',
                        isPinned: msg.is_pinned.Bool || false
                    }));
                    setMessages(formattedMessages);
                })
                .catch(error => {
                    console.error("Error fetching message history:", error);
                });
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        fetchUserNickName();
    }, []);

    const fetchMembers = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:8080/v1/2024/chat/get_member/${roomId}`, {
                headers: {
                    "Authorization": `Bearer ${user}`
                }
            });
            const data = await response.json();
            setMembers(data.data);
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const handleRoomHeaderClick = async () => {
        if (currentRoom) {
            await fetchMembers(currentRoom);
            setShowMembers(!showMembers);
        } else {
            console.error("Current room is not defined or does not have a room_id");
        }
    };

    const handleDeleteMember = async (userId) => {
        try {
            await fetch(`http://localhost:8080/v1/2024/chat/delete_member/${currentRoom.room_id}/${userId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${user}`
                }
            });
            setMembers(prevMembers => prevMembers.filter(member => member.id !== userId));
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    };

    return (
        <div className="message-container">
            <div className="sidebar">
                <h1>Danh sách phòng chat</h1>
                {loading ? (
                    <div>Đang tải phòng chat...</div>
                ) : chats.length === 0 ? (
                    <div>Không có phòng chat nào</div>
                ) : (
                    <ul className="chat-list">
                        {chats.map(chat => (
                            <li key={chat.room_id} className="chat-item" onClick={() => joinRoom(chat.room_id)}>
                                <div className="chat-avatar">
                                    <img src={chat.avatar || 'default-avatar.png'} alt="Avatar" />
                                </div>
                                <div className="chat-name">{chat.name}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="chat-area">
                {currentRoom && (
                    <div className="room-header" onClick={handleRoomHeaderClick}>
                        <img src={currentRoom.avatar || 'default-avatar.png'} alt="Room Avatar" className="room-avatar" />
                        <h2 className="room-title">{currentRoom.name}</h2>
                    </div>
                )}
                {showMembers && (
                    <div className="members-list">
                        {members.map(member => (
                            <div key={member.id} className="member-item">
                                <img src={member.user_avatar || 'default-avatar.png'} alt="Member Avatar" className="member-avatar" />
                                <span>{member.user_nickname}</span>
                                <button onClick={() => handleDeleteMember(member.id)}>Xóa</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="message-chat-area">
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message-bubble ${msg.sender === userNickName ? 'my-message' : 'other-message'}`}
                        >
                            <strong>{msg.sender}:</strong> {msg.message}
                            <span className="message-time">{msg.createdAt}</span>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {currentRoom && (
                    <form onSubmit={sendMessage} className="message-input-container">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="message-input"
                        />
                        <button type="submit" className="send-button">
                            Gửi
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Message;