import { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface TerminalInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TerminalInput({ onSubmit, disabled, placeholder }: TerminalInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on the input
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-surface-1 border-t border-border px-4 py-3"
    >
      <span className="text-accent font-mono text-sm select-none">{'>'}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? (disabled ? 'Processing...' : 'Ask something about your documents...')}
        className="flex-1 bg-transparent text-text-primary font-mono text-sm
          placeholder-text-tertiary outline-none caret-accent
          disabled:opacity-40"
        autoComplete="off"
        id="chat-input"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-8 h-8 flex items-center justify-center rounded-md
          text-text-tertiary transition-colors duration-150
          hover:text-accent hover:bg-accent/10
          disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-text-tertiary"
        title="Send (Enter)"
      >
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
