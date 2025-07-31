import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, X, Loader } from 'lucide-react';
import axios from 'axios';

const socket = io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true
});

const ChatModal = ({ currentUserId, chatPartner, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const establishChatRoom = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/apis/lost-and-found/chat/room`,
                    { otherUserId: chatPartner.id },
                    { withCredentials: true }
                );
                const fetchedRoomId = response.data.roomId;
                setRoomId(fetchedRoomId);
                socket.emit('joinRoom', fetchedRoomId);
                const historyResponse = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/apis/lost-and-found/chat/history/${fetchedRoomId}`,
                    { withCredentials: true }
                );
                setMessages(historyResponse.data);
            } catch (err) {
                console.error('Error establishing chat room or fetching history:', err);
                setError('Could not load chat. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUserId && chatPartner && chatPartner.id) {
            establishChatRoom();
        }

        return () => {
            if (roomId) {
                socket.emit('leaveRoom', roomId);
            }
        };
    }, [currentUserId, chatPartner, roomId]);

    useEffect(() => {
        const handleNewMessage = (newMessage) => {
            if (newMessage.chatRoom === roomId) {
                setMessages((prevMessages) => {
                    const isDuplicate = prevMessages.some(msg => msg._id === newMessage._id);
                    return isDuplicate ? prevMessages : [...prevMessages, newMessage];
                });
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputMessage.trim() && roomId) {
            try {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/apis/lost-and-found/chat/message`,
                    { roomId, message: inputMessage.trim() },
                    { withCredentials: true }
                );
                setInputMessage('');
            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message.');
            }
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[700px] flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">
                        Chat about: <span className="text-indigo-600">{chatPartner.title}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <Loader className="animate-spin mr-2" />
                            <span>Loading Chat...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <span>{error}</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No messages yet. Say hello!</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex items-end gap-2 ${msg.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-2xl ${
                                        msg.sender._id === currentUserId
                                            ? 'bg-indigo-600 text-white rounded-br-lg'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-lg'
                                    }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                    <p className={`text-xs text-right mt-1 ${msg.sender._id === currentUserId ? 'text-indigo-200' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            className="flex-grow p-3 rounded-full bg-gray-100 text-gray-800 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!roomId || isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            disabled={!roomId || !inputMessage.trim() || isLoading}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ChatModal;
