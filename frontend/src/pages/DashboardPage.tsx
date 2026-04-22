import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { listDocuments, listTickets, getRateLimitStatus } from '../lib/api';
import { MessageSquare, FileText, Ticket, ArrowRight, Zap } from 'lucide-react';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  href: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
    >
      <Link
        to={href}
        className="block bg-surface-2 border border-border rounded-md p-4
          hover:border-border-hover hover:bg-surface-3 transition-all duration-150 group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-8 h-8 flex items-center justify-center bg-surface-3 border border-border rounded-sm">
            <Icon size={16} className="text-text-tertiary group-hover:text-accent transition-colors" />
          </div>
          <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-2xl font-semibold text-text-primary font-mono">{value}</p>
        <p className="text-xs text-text-secondary mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-text-tertiary font-mono mt-1">{sub}</p>}
      </Link>
    </motion.div>
  );
}

export function DashboardPage() {
  const { userName } = useAuth();
  const [stats, setStats] = useState({
    docs: '-',
    openTickets: '-',
    rateLimit: '-',
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [docs, tickets, rate] = await Promise.all([
          listDocuments(),
          listTickets(),
          getRateLimitStatus(),
        ]);
        setStats({
          docs: String(docs.length),
          openTickets: String(tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length),
          rateLimit: String(rate.dailyRemaining),
        });
      } catch {
        // silent fail
      }
    }
    loadStats();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-6 py-4 border-b border-border">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-text-primary"
          >
            {greeting}, <span className="text-accent">{userName}</span>
          </motion.h1>
          <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
            RAG Scanner — agentic document analysis
          </p>
        </div>

        <div className="p-6 max-w-2xl">
          {/* Stats grid */}
          <p className="text-[11px] text-text-tertiary font-mono uppercase tracking-wider mb-3">Overview</p>
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
            <StatCard icon={FileText} label="Documents" value={stats.docs} sub="uploaded to your account" href="/documents" delay={0} />
            <StatCard icon={Ticket} label="Open Tickets" value={stats.openTickets} sub="awaiting resolution" href="/tickets" delay={0.05} />
            <StatCard icon={Zap} label="Daily Requests Left" value={stats.rateLimit} sub="resets at midnight UTC" href="/chat" delay={0.1} />
          </div>

          {/* Quick actions */}
          <p className="text-[11px] text-text-tertiary font-mono uppercase tracking-wider mb-3">Quick Start</p>
          <div className="space-y-1.5">
            {[
              { href: '/chat', icon: MessageSquare, label: 'Start a chat', sub: 'Ask questions about your documents' },
              { href: '/documents', icon: FileText, label: 'Upload a PDF', sub: 'Add context for the RAG pipeline' },
              { href: '/tickets', icon: Ticket, label: 'View tickets', sub: 'See and manage support tickets' },
            ].map(({ href, icon: Icon, label, sub }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <Link
                  to={href}
                  className="flex items-center gap-3 px-4 py-3 bg-surface-2 border border-border
                    rounded-md hover:border-border-hover hover:bg-surface-3
                    transition-all duration-150 group"
                >
                  <Icon size={16} className="text-text-tertiary group-hover:text-accent shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary font-medium">{label}</p>
                    <p className="text-[10px] text-text-tertiary font-mono">{sub}</p>
                  </div>
                  <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
