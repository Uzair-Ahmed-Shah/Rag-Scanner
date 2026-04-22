import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { TerminalInput } from './TerminalInput';
import { ThinkingIndicator } from './ThinkingIndicator';
import { sendChatMessage, type ChatSource } from '../../lib/api';
import { MessageSquare, AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  intent?: string;
  isError?: boolean;
  sources?: ChatSource[];
}

export function ChatPanel() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  const handleSubmit = async (query: string) => {
    if (isEscalated) return;
    setRateLimitMsg(null);
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(query);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: data.response, intent: data.debug_intent, sources: data.sources },
      ]);

      if (data.escalated) {
        setIsEscalated(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const msg = err.response.data?.error || 'Rate limit reached.';
        setRateLimitMsg(msg);
        // Remove the optimistic user message on rate limit
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: 'Connection error — could not reach the server.', isError: true },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setIsEscalated(false);
    setMessages((prev) => [
      ...prev,
      { role: 'bot', content: 'Continuing chat. Note: your ticket remains open.', intent: 'GREETING' },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">Chat</h1>
          <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
            llama-3.3 · transformers.js · pgvector
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-[10px] font-mono text-text-tertiary hover:text-text-secondary
              border border-border px-2 py-1 rounded-sm transition-colors"
          >
            clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <MessageSquare size={28} className="text-text-tertiary mb-3 opacity-40" />
            <p className="text-text-tertiary text-xs font-mono">No messages yet. Type a query below.</p>
            <p className="text-text-tertiary text-[10px] font-mono mt-1 opacity-60">
              Upload a document first to ask questions about it.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} {...msg} />
            ))}
            {isLoading && <ThinkingIndicator />}
          </>
        )}
      </div>

      {/* Rate limit banner */}
      <AnimatePresence>
        {rateLimitMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-2 px-4 py-2.5 bg-amber-400/5 border border-amber-400/20 rounded-md
              flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <p className="text-xs font-mono text-amber-400">{rateLimitMsg}</p>
            </div>
            <button onClick={() => setRateLimitMsg(null)} className="text-text-tertiary text-[10px] font-mono hover:text-text-secondary">dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Escalation choice banner */}
      <AnimatePresence>
        {isEscalated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-5 mb-2 px-4 py-3 bg-surface-2 border border-border rounded-md"
          >
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-primary font-medium">Your query has been escalated</p>
                <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
                  A support ticket has been created. What would you like to do?
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleContinue}
                className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5
                  border border-border rounded-sm text-text-secondary
                  hover:border-border-hover hover:text-text-primary transition-colors"
              >
                <MessageCircle size={12} /> Continue chatting
              </button>
              <button
                onClick={() => navigate('/tickets')}
                className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5
                  border border-accent/30 rounded-sm text-accent bg-accent/5
                  hover:bg-accent/10 transition-colors"
              >
                View tickets <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <TerminalInput
        onSubmit={handleSubmit}
        disabled={isLoading || isEscalated}
        placeholder={isEscalated ? 'Chat paused — choose an option above' : undefined}
      />
    </div>
  );
}
