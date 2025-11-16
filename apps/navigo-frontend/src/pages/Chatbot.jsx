import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m your Singapore tourist guide. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(inputMessage);
      const botMessage = {
        type: 'bot',
        text: response.data.message || response.data.reply || 'I\'m here to help!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Recommendations',
    'Route planner',
    'Translation',
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="chatbot-page">
      <div className="card">
        <h1>💬 AI Tourist Assistant</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Ask me anything about Singapore tourism, attractions, food, and more!
        </p>
      </div>

      <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1rem',
          background: '#f9f9f9',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem'
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '1rem',
                  borderRadius: 'var(--border-radius)',
                  background: message.type === 'user' ? 'var(--primary-color)' : 'white',
                  color: message.type === 'user' ? 'white' : 'var(--text-color)',
                  boxShadow: 'var(--box-shadow)'
                }}
              >
                <p style={{ margin: 0 }}>{message.text}</p>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.75rem', 
                  opacity: 0.7 
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--border-radius)',
                background: 'white',
                boxShadow: 'var(--box-shadow)'
              }}>
                <p style={{ margin: 0 }}>Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            Quick questions:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '1rem',
              border: '2px solid #ddd',
              borderRadius: 'var(--border-radius)',
              fontSize: '1rem'
            }}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !inputMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
