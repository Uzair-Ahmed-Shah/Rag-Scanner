import { motion } from 'framer-motion';

export function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-4 border-b border-border-subtle"
    >
      <div className="flex items-center gap-3 pl-1">
        <div className="w-5 h-5 flex items-center justify-center shrink-0
          bg-surface-3 border border-border rounded-sm">
          <span className="block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        </div>
        <p className="text-text-tertiary font-mono text-sm italic">
          processing<span className="animate-blink">_</span>
        </p>
      </div>
    </motion.div>
  );
}
