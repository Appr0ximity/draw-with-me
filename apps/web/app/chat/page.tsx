'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';

interface Message {
  user: string;
  message: string;
  timestamp?: string;
}

interface Room {
  id: number;
  slug: string;
  createdAt: string;
  adminId: string;
}

export default function ChatPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomSlug, setNewRoomSlug] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode token to get username (you might want to store this in localStorage)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length >= 2 && tokenParts[1]) {
        const payload = JSON.parse(atob(tokenParts[1]));
        setUsername(payload.id || 'user'); // Using ID as username for now
      } else {
        setUsername('user');
      }
    } catch (e) {
      console.error('Error decoding token');
      setUsername('user');
    }

    // Connect to WebSocket
    const websocket = new WebSocket(`ws://localhost:8080?token=${token}`);
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.user && data.message) {
          setMessages(prev => [...prev, {
            user: data.user,
            message: data.message,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } else if (typeof data === 'string') {
          // Handle join/leave room responses
          console.log('Server message:', data);
        }
      } catch (e) {
        console.log('Server message:', event.data);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, [router]);

  const sendMessage = () => {
    if (currentMessage.trim() && ws && currentRoom) {
      ws.send(JSON.stringify({
        type: 'chat-room',
        slug: currentRoom,
        message: currentMessage.trim()
      }));
      setCurrentMessage('');
    }
  };

  const joinRoom = (roomSlug: string) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'join-room',
        slug: roomSlug
      }));
      setCurrentRoom(roomSlug);
      setMessages([]); // Clear messages when joining new room
    }
  };

  const leaveRoom = () => {
    if (ws && currentRoom) {
      ws.send(JSON.stringify({
        type: 'leave-room',
        slug: currentRoom
      }));
      setCurrentRoom('');
      setMessages([]);
    }
  };

  const createRoom = async () => {
    if (!newRoomSlug.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slug: newRoomSlug.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setRooms(prev => [...prev, data.room]);
        setNewRoomSlug('');
        setShowCreateRoom(false);
        joinRoom(data.room.slug);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">Draw With Me</h1>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              Logout
            </Button>
          </div>
          <div className="mt-3 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm text-indigo-100 font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Room Management */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Rooms</h2>
            <Button 
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              {showCreateRoom ? 'Cancel' : 'Create Room'}
            </Button>
          </div>

          {showCreateRoom && (
            <div className="mb-4 space-y-3">
              <input
                type="text"
                placeholder="Room name"
                value={newRoomSlug}
                onChange={(e) => setNewRoomSlug(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <Button onClick={createRoom} size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                Create
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room.slug)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentRoom === room.slug
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-gray-100 text-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-current mr-3"></div>
                  #{room.slug}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Room Info */}
        {currentRoom && (
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-800">
                  #{currentRoom}
                </span>
              </div>
              <Button onClick={leaveRoom} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                Leave
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {currentRoom ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      msg.user === username
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200/50'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-80">
                      {msg.user === username ? 'You' : msg.user}
                    </div>
                    <div className="text-sm">{msg.message}</div>
                    {msg.timestamp && (
                      <div className="text-xs mt-2 opacity-70">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200/50 p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!currentMessage.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Welcome to Draw With Me
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Join a room to start chatting and creating together
              </p>
              <Button 
                onClick={() => setShowCreateRoom(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 text-lg"
              >
                Create Your First Room
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
