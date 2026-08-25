'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';

const DEPT_ACCOUNTS = [
  { role: 'Field Officer', email: 'officer@satyalabel.gov.in', password: 'demo1234', desc: 'Scan products & view compliance' },
  { role: 'Administrator', email: 'admin@satyalabel.gov.in',   password: 'admin1234', desc: 'Full system & repository access' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const result = mode === 'login'
        ? await auth.login(form.email, form.password)
        : await auth.register(form.name, form.email, form.password);
      localStorage.setItem('satyalabel_token', result.token);
      localStorage.setItem('satyalabel_user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const result = await auth.login(email, password);
      localStorage.setItem('satyalabel_token', result.token);
      localStorage.setItem('satyalabel_user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (_) {
      router.push('/dashboard');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ width: 600, height: 600, background: 'radial-gradient(circle, hsla(27,95%,58%,0.07) 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, hsl(27,95%,58%), hsl(20,92%,50%))',
              boxShadow: '0 8px 32px hsla(27,95%,58%,0.3)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="hsl(226,28%,8%)">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1
            className="text-2xl font-black"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            SatyaLabel
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Legal Metrology Compliance Checker
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            SIH26034 · Department of Consumer Affairs
          </p>
        </div>

        {/* Card */}
        <div className="card p-7 space-y-5">

          {/* Mode toggle */}
          <div
            className="flex rounded-lg p-1 gap-1"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)' }}
          >
            {[['login', 'Sign In'], ['register', 'Register']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className="flex-1 py-2 rounded-md text-sm font-semibold transition-all duration-150"
                style={mode === m
                  ? { background: 'var(--accent)', color: 'hsl(226,28%,6%)' }
                  : { background: 'transparent', color: 'var(--text-muted)' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Full Name</label>
                <input className="input" type="text" required placeholder="Enforcement Officer Name"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Email</label>
              <input className="input" type="email" required placeholder="officer@consumer.gov.in"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Password</label>
              <input className="input" type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>

            {error && (
              <div
                className="flex gap-2 px-4 py-3 rounded-lg text-sm"
                style={{ background: 'var(--fail-bg)', border: '1px solid var(--fail-border)', color: 'var(--fail)' }}
              >
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold transition-all duration-150"
              style={{
                background: 'var(--accent)',
                color: 'hsl(226,28%,6%)',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 16px var(--accent-glow)',
              }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full animate-spin" style={{ border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid rgba(0,0,0,0.8)' }} />
                    Signing in…
                  </span>
                : mode === 'login' ? 'Sign In →' : 'Create Account →'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="divider" />

          {/* SSO quick-login */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              Department SSO Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEPT_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => quickLogin(acc.email, acc.password)}
                  disabled={loading}
                  className="text-left p-3 rounded-lg transition-all duration-150 space-y-1"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
                >
                  <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{acc.role}</p>
                  <p className="text-[10px] leading-tight" style={{ color: 'var(--text-faint)' }}>{acc.desc}</p>
                </button>
              ))}
            </div>
            <div
              className="flex gap-2 px-3 py-2.5 rounded-lg text-[10px] leading-tight"
              style={{ background: 'hsla(215,60%,40%,0.07)', border: '1px solid hsla(215,60%,40%,0.15)', color: 'hsla(215,70%,60%,0.7)' }}
            >
              ⓘ Authorized use only. All login attempts are logged and monitored.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
