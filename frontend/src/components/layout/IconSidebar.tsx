import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  MessageSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Scan,
  Ticket,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
];

export function IconSidebar() {
  const { userName, email, logout } = useAuth();
  const location = useLocation();
  const initial = userName?.charAt(0)?.toUpperCase() || '?';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-44 bg-surface-1 border-r border-border
      flex flex-col z-50">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Scan size={18} className="text-accent shrink-0" strokeWidth={2.5} />
          <span className="text-sm font-semibold text-text-primary tracking-tight">RAG Scanner</span>
        </div>
        <p className="text-[10px] text-text-tertiary font-mono mt-1">agentic · rag · llm</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1 p-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to ||
            (to !== '/' && location.pathname.startsWith(to));

          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex items-center gap-2.5 px-3 py-2 rounded-md
                text-sm transition-colors duration-150
                ${isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-2'
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-accent rounded-r" />
              )}
              <Icon size={16} className="shrink-0" />
              <span className="font-mono text-xs">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 flex items-center justify-center shrink-0 rounded-sm
            bg-surface-3 border border-border text-text-secondary font-mono text-xs font-medium">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-primary font-medium truncate">{userName}</p>
            <p className="text-[10px] text-text-tertiary font-mono truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md
            text-text-tertiary hover:text-red-400 hover:bg-red-400/10
            transition-colors duration-150 text-xs font-mono"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
