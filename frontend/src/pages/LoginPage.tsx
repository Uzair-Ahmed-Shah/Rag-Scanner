import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Scan, ArrowRight, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(email.trim(), password, name.trim());
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-surface-0">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fafafa 1px, transparent 1px),
            linear-gradient(90deg, #fafafa 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        <div className="bg-surface-1/80 backdrop-blur-sm border border-border rounded-md p-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-6">
            <Scan size={20} className="text-accent" strokeWidth={2.5} />
            <span className="text-lg font-semibold text-text-primary tracking-tight">RAG Scanner</span>
          </div>

          <p className="text-text-tertiary font-mono text-xs mb-6 leading-relaxed">
            Agentic document analysis with intelligent<br />
            routing, vector search, and LLM orchestration.
          </p>

          {/* Mode toggle */}
          <div className="flex gap-0 mb-6 border border-border rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 text-xs font-medium py-2 transition-colors
                ${mode === 'login'
                  ? 'bg-surface-3 text-text-primary'
                  : 'bg-surface-1 text-text-tertiary hover:text-text-secondary'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 text-xs font-medium py-2 transition-colors border-l border-border
                ${mode === 'signup'
                  ? 'bg-surface-3 text-text-primary'
                  : 'bg-surface-1 text-text-tertiary hover:text-text-secondary'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-[11px] text-text-tertiary font-mono mb-1 uppercase tracking-wider">
                  Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  className="input-base w-full"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-[11px] text-text-tertiary font-mono mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                autoFocus
                autoComplete="email"
                className="input-base w-full"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-[11px] text-text-tertiary font-mono mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="input-base w-full"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono bg-red-400/5 border border-red-400/20 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create Account' : 'Login'} <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Decorative line */}
        <div className="absolute -bottom-4 left-8 right-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </div>
  );
}
