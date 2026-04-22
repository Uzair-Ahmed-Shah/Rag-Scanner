const INTENT_CONFIG: Record<string, { label: string; className: string }> = {
  KNOWLEDGE_QUERY: {
    label: 'RAG',
    className: 'border-accent/40 text-accent',
  },
  GREETING: {
    label: 'GREETING',
    className: 'border-text-tertiary text-text-tertiary',
  },
  HUMAN_ESCALATION: {
    label: 'ESCALATION',
    className: 'border-amber-500/40 text-amber-400',
  },
};

export function IntentTag({ intent }: { intent: string }) {
  const config = INTENT_CONFIG[intent] ?? {
    label: intent,
    className: 'border-text-tertiary text-text-tertiary',
  };

  return (
    <span
      className={`inline-block font-mono text-[10px] tracking-wider uppercase
        border px-1.5 py-0.5 rounded-sm ${config.className}`}
    >
      {config.label}
    </span>
  );
}
