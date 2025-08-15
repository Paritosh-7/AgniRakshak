import React, { useState } from 'react';
import './Chatbot.css';
import { getChatbotResponse } from './chatbotService.js';

function Chatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: "You are Saarthi, a helpful assistant for fire and safety emergencies. Respond politely and guide the user during emergencies."
    },
    {
      role: 'assistant',
      content: "Hello! I'm Saarthi. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsChatOpen(prev => !prev);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await getChatbotResponse(input); // ✅ Send only the latest message
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Sorry, I couldn't process that right now. Please try again later."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button className="chat-toggle-btn" onClick={toggleChat}>
        💬 Chat
      </button>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="chatbox">
          <div className="chat-header">Saarthi</div>
          <div className="chat-body">
            {messages
              .filter(msg => msg.role !== 'system')
              .map((msg, idx) => (
                <p key={idx}>
                  <strong>{msg.role === 'user' ? 'You' : 'Saarthi'}:</strong> {msg.content}
                </p>
              ))}
            {loading && <p><em>Saarthi is typing...</em></p>}
          </div>
          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
