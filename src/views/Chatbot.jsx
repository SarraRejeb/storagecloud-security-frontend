import React, { useState } from 'react';
import axios from 'axios';

const SecurityChatbot = () => {
  const [messages, setMessages] = useState([{ from: 'bot', text: "Pose-moi une question sur la sécurité cloud ou les failles OWASP." }]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", { prompt: input });
      setMessages([...newMessages, { from: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages([...newMessages, { from: 'bot', text: "❌ Erreur de réponse du serveur." }]);
    }
  };

  return (
    <div className="p-3 border rounded bg-light">
      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "5px 0" }}>
            <span className={`p-2 rounded ${msg.from === "user" ? "bg-primary text-white" : "bg-white border"}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <input
        type="text"
        className="form-control mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Pose une question…"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button className="btn btn-primary w-100" onClick={handleSend}>Envoyer</button>
    </div>
  );
};

export default SecurityChatbot;
