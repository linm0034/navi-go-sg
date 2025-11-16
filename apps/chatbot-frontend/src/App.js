import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const CHAT_API = '/api/chat';

function App() {
  const [messages, setMessages] = useState([]); // { sender: 'user'|'bot', text }
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Fetch default prompt (empty body) to get startup menu from backend
    const fetchDefault = async () => {
      try {
        const res = await fetch(CHAT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
  const botReply = data.reply || 'Hello! Ask me for recommendations, routes, or translations.';
  setMessages([{ sender: 'bot', text: botReply }]);
  if (data.sessionId) setSessionId(data.sessionId);
      } catch (e) {
        console.error('Failed to fetch default prompt', e);
        setMessages([{ sender: 'bot', text: 'Hello! (backend unreachable)' }]);
      }
    };
    fetchDefault();
  }, []);

  useEffect(() => {
    // scroll to bottom when messages update
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    setError(null);
    setInput('');

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, sessionId }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
  const botMsg = { sender: 'bot', text: data.reply || 'No reply' };
  setMessages((m) => [...m, botMsg]);
  if (data.sessionId) setSessionId(data.sessionId);
    } catch (e) {
      console.error(e);
      setError('Failed to contact backend. See console.');
      setMessages((m) => [...m, { sender: 'bot', text: 'Failed to contact backend. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-wrapper">
        <div className="chat-container">
          <h2 className="title">Tourism chatbot</h2>

          <div className="messages" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender}`}>
                <div className="bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type your message"
              disabled={loading}
              aria-label="Message input"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="send-btn">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

