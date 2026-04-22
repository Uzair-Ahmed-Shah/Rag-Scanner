import { motion } from 'framer-motion';
import { IntentTag } from '../ui/IntentTag';
import { Bot, FileText } from 'lucide-react';
import type { ChatSource } from '../../lib/api';

interface ChatMessageProps {
  role: 'user' | 'bot';
  content: string;
  intent?: string;
  isError?: boolean;
  sources?: ChatSource[];
}

export function ChatMessage({ role, content, intent, isError, sources }: ChatMessageProps) {
  // Deduplicate sources by filename
  const uniqueSources = sources
    ? [...new Map(sources.map((s) => [s.fileName, s])).values()]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="py-4 border-b border-border-subtle last:border-b-0"
    >
      {role === 'user' ? (
        <div className="flex items-start gap-3">
          <span className="text-accent font-mono text-sm select-none shrink-0 pt-0.5">{'>'}</span>
          <p className="text-text-primary font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 pl-1">
          <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5
            bg-surface-3 border border-border rounded-sm">
            <Bot size={12} className="text-text-tertiary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-relaxed whitespace-pre-wrap
              ${isError ? 'text-red-400' : 'text-text-secondary'}`}>
              {content}
            </p>

            {/* Source citations */}
            {uniqueSources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uniqueSources.map((src, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] font-mono
                      text-text-tertiary bg-surface-2 border border-border-subtle
                      px-1.5 py-0.5 rounded-sm"
                  >
                    <FileText size={9} />
                    {src.fileName}
                  </span>
                ))}
              </div>
            )}

            {intent && (
              <div className="mt-2">
                <IntentTag intent={intent} />
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
