import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { listTickets, closeTicket, type TicketSummary } from '../lib/api';
import { Ticket, ChevronDown, ChevronUp, X, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  OPEN: { label: 'OPEN', icon: AlertCircle, className: 'text-amber-400 border-amber-400/40' },
  IN_PROGRESS: { label: 'IN PROGRESS', icon: Clock, className: 'text-blue-400 border-blue-400/40' },
  RESOLVED: { label: 'RESOLVED', icon: CheckCircle2, className: 'text-accent border-accent/40' },
  CLOSED: { label: 'CLOSED', icon: CheckCircle2, className: 'text-text-tertiary border-border' },
};

function StatusBadge({ status }: { status: TicketSummary['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider
      border px-1.5 py-0.5 rounded-sm ${cfg.className}`}>
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

function TicketRow({ ticket, onClose }: { ticket: TicketSummary; onClose: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setClosing(true);
    try {
      await onClose(ticket.id);
    } finally {
      setClosing(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const canClose = ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      layout
      className="bg-surface-2 border border-border rounded-sm overflow-hidden"
    >
      {/* Row header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-3 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <Ticket size={14} className="text-text-tertiary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-primary font-mono truncate">{ticket.query}</p>
          <p className="text-[10px] text-text-tertiary font-mono mt-0.5">{formatDate(ticket.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={ticket.status} />
          {expanded ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-border px-4 py-3"
          >
            <div className="mb-3">
              <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider mb-1">Full query</p>
              <p className="text-xs text-text-secondary leading-relaxed">{ticket.query}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-tertiary font-mono">
                  ID: <span className="text-text-secondary">{ticket.id.slice(0, 8)}…</span>
                </p>
                {ticket.closedAt && (
                  <p className="text-[10px] text-text-tertiary font-mono">
                    Closed: <span className="text-text-secondary">{formatDate(ticket.closedAt)}</span>
                  </p>
                )}
              </div>
              {canClose && (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5
                    border border-border rounded-sm text-text-secondary
                    hover:border-red-400/30 hover:text-red-400 hover:bg-red-400/5
                    transition-colors disabled:opacity-40"
                >
                  {closing ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                  Close ticket
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listTickets();
      setTickets(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleClose = async (ticketId: string) => {
    await closeTicket(ticketId);
    setTickets((prev) => prev.map((t) =>
      t.id === ticketId ? { ...t, status: 'CLOSED', closedAt: new Date().toISOString() } : t
    ));
  };

  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Support Tickets</h1>
            <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
              {loading ? 'loading…' : `${tickets.length} total · ${openCount} open`}
            </p>
          </div>
          <button
            onClick={fetchTickets}
            className="text-[10px] font-mono text-text-tertiary hover:text-text-secondary
              border border-border px-2 py-1 rounded-sm transition-colors"
          >
            refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={18} className="animate-spin text-text-tertiary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Ticket size={24} className="text-text-tertiary opacity-40 mb-2" />
              <p className="text-xs text-text-tertiary font-mono">No tickets yet.</p>
              <p className="text-[10px] text-text-tertiary font-mono mt-1">Tickets are created when a query is escalated.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-w-2xl">
              <AnimatePresence>
                {tickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} onClose={handleClose} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
