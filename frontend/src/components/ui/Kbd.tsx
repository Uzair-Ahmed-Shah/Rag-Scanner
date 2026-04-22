export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center gap-1 font-mono text-[10px] text-text-tertiary
      bg-surface-2 border border-border px-1.5 py-0.5 rounded-sm leading-none">
      {children}
    </kbd>
  );
}
