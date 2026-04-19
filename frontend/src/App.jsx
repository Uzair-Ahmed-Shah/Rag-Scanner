import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, MessageSquare, LogOut, CheckCircle, Bot } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const stringToUUID = (str) => {
  const hex = Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .padEnd(32, '0')
    .slice(0, 32);
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const getInitialUserId = () => {
  const stored = localStorage.getItem('userId');
  if (!stored) return '';
  // Verify it's actually a UUID so old cached usernames don't break the app
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stored);
  if (!isValidUUID) {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    return '';
  }
  return stored;
};

function App() {
  const [userId, setUserId] = useState(getInitialUserId());
  const [tempUserId, setTempUserId] = useState('');

  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (tempUserId.trim()) {
      const uuidFormatted = stringToUUID(tempUserId.trim());
      setUserId(uuidFormatted);
      localStorage.setItem('userId', uuidFormatted);
      localStorage.setItem('userName', tempUserId.trim());
    }
  };

  const handleLogout = () => {
    setUserId('');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setChatHistory([]);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, { query: userMessage.content, userId });
      const botMessage = { role: 'bot', content: response.data.response, intent: response.data.debug_intent };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { role: 'bot', content: 'Connection Error from Server.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    formData.append('userId', userId);
    
    setUploadStatus('uploading');
    try {
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('success');
      setFile(null);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      setUploadStatus('error');
    }
  };

  if (!userId) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Bot size={32} />
            </div>
          </div>
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Agentic RAG Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter a User ID</label>
              <p className="text-xs text-gray-400 mb-2">Used for multi-tenant context isolation</p>
              <input
                type="text"
                value={tempUserId}
                onChange={(e) => setTempUserId(e.target.value)}
                className="w-full rounded-md border-gray-300 border p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. uzair-123"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 p-3 text-white font-medium hover:bg-blue-700 transition"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="w-full md:w-80 bg-white border-r flex flex-col justify-between">
        <div className="p-6 border-b">
           <div className="flex items-center gap-3 text-blue-600 font-bold text-xl mb-4">
            <Bot size={24} /> RAG Scanner
           </div>
           <div className="text-sm bg-gray-50 p-3 rounded border text-gray-700 flex flex-col gap-1">
             <span className="flex justify-between items-center">
               Active User: <span className="font-mono text-xs ml-1 bg-gray-200 px-1 py-0.5 rounded">{localStorage.getItem('userName') || 'Demo'}</span>
             </span>
             <span className="text-[10px] text-gray-400 font-mono truncate">{userId}</span>
           </div>
        </div>

        <div className="p-6 flex-1 border-b">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UploadCloud size={18} /> Upload Context
          </h3>
          <p className="text-xs text-gray-500 mb-4">Files uploaded here are strictly mapped to your User ID.</p>
          
          <input 
            type="file" 
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />

          <button 
            onClick={handleFileUpload}
            disabled={!file || uploadStatus === 'uploading'}
            className="w-full bg-gray-800 text-white rounded p-2 text-sm disabled:opacity-50 hover:bg-gray-700 transition"
          >
            {uploadStatus === 'uploading' ? 'Vectorizing...' : 'Upload PDF'}
          </button>

          {uploadStatus === 'success' && (
            <div className="mt-3 text-sm text-green-600 flex gap-2 items-center">
              <CheckCircle size={16} /> File Processed
            </div>
          )}
          {uploadStatus === 'error' && (
            <div className="mt-3 text-sm text-red-600">Failed to process. Check logs.</div>
          )}
        </div>

        <div className="p-6">
          <button 
            onClick={handleLogout}
            className="w-full border border-red-200 text-red-600 rounded p-2 text-sm hover:bg-red-50 flex items-center justify-center gap-2 transition"
          >
            <LogOut size={16} /> Switch User
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 max-h-screen">
        <div className="p-6 border-b bg-white shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Support Orchestrator</h1>
          <p className="text-gray-500 text-sm">Powered by Llama 3.3, Transformers.js, and pgvector</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>No messages yet. Ask a question to trigger the routing engine!</p>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg p-4 shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' 
                  : msg.isError ? 'bg-red-100 text-red-700' 
                  : 'bg-white border text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.intent && (
                    <div className="mt-3 text-xs flex gap-1 items-center bg-gray-100 text-gray-600 w-fit px-2 py-1 rounded">
                      <span className="font-semibold text-[10px] uppercase">Strategy:</span> {msg.intent}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg p-4 shadow-sm text-gray-400 animate-pulse">
                Agent is thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t">
          <form onSubmit={handleChat} className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium disabled:opacity-50 hover:bg-blue-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;