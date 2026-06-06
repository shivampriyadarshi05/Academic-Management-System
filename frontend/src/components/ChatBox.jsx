// ============================================
// ChatBox.jsx — Chat Component for Absent Students
// ============================================
// This component shows a chat interface between a student and teacher.
// It uses setInterval to poll for new messages every 5 seconds.
// It uses useRef to auto-scroll to the latest message.

import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const ChatBox = ({ studentId, receiverId }) => {
  const [messages, setMessages] = useState([]);   // Array of chat messages
  const [newMessage, setNewMessage] = useState(''); // Text being typed
  const [loading, setLoading] = useState(true);     // Loading state
  const [error, setError] = useState('');            // Error message
  const messagesEndRef = useRef(null);               // Ref for auto-scrolling

  // Get the logged-in user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Auto-scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${studentId}`);
      setMessages(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  // Poll for new messages every 5 seconds
  useEffect(() => {
    fetchMessages(); // fetch immediately on mount

    // Set up polling interval
    const interval = setInterval(fetchMessages, 5000);

    // Cleanup: clear the interval when component unmounts
    // This prevents memory leaks
    return () => clearInterval(interval);
  }, [studentId]);

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send a new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/messages', {
        receiverId,
        text: newMessage.trim(),
      });
      setNewMessage(''); // clear the input
      fetchMessages();   // refresh messages
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-dark-border">
        <h3 className="text-sm font-semibold text-text-primary">💬 Chat</h3>
        <p className="text-xs text-text-secondary">Messages update every 5 seconds</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-2 p-2 bg-danger/10 border border-danger/30 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-text-secondary text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  msg.senderId === user.id
                    ? 'bg-primary/20 text-primary-light rounded-br-sm'
                    : 'bg-dark-border/50 text-text-primary rounded-bl-sm'
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-70">
                  {msg.senderRole === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                </p>
                <p>{msg.text}</p>
                <p className="text-[10px] opacity-50 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        {/* Invisible element at the bottom — used for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-dark-border flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-lg bg-dark border border-dark-border text-text-primary text-sm
            placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium
            transition-colors duration-200 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
