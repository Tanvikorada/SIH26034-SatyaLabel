"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import NavBar from '@/components/NavBar';
import { triggerHaptic } from '@/utils/haptics';
import { LogOut, Moon, Sun, Monitor, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const RULES_VERSION = 'v1.4 — LM(PC) Rules 2011, Amendment 2022';
const APP_VERSION   = '2.5.0';
const BUILD_DATE    = '2026-09-04';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted]       = useState(false);
  const [showAbout, setShowAbout]   = useState(false);
  const [email, setEmail]           = useState('');
  const [role, setRole]             = useState('');

  useEffect(() => {
    setMounted(true);
    const t = sessionStorage.getItem('token');
    if (!t) { router.push('/login'); return; }
    setEmail(sessionStorage.getItem('email') || '');
    setRole(sessionStorage.getItem('role') || 'officer');
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <NavBar />

      <main className="max-w-[700px] mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade-in">
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight leading-[1.1] mb-2">Settings</h1>
        <p className="text-[15px] text-text-secondary mb-8">Manage your application preferences and account.</p>

        <div className="flex flex-col gap-6">

          {/* ── Logged-in User Card ───────────────────────────────── */}
          <div className="glass rounded-[24px] border border-border/50 p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/80 to-blue-600 flex items-center justify-center text-white font-bold text-[18px] shadow-lg shrink-0">
              {email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[15px] text-text-primary truncate">{email || 'Not signed in'}</p>
              <p className="text-[12px] text-text-muted capitalize">{role} · SatyaLabel v{APP_VERSION}</p>
            </div>
          </div>

          {/* ── Appearance ───────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-2">Appearance</h2>
            <div className="glass rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
              {[
                { label: 'Light Mode',   value: 'light',  Icon: Sun   },
                { label: 'Dark Mode',    value: 'dark',   Icon: Moon  },
                { label: 'System Match', value: 'system', Icon: Monitor },
              ].map(({ label, value, Icon }, i, arr) => (
                <div
                  key={value}
                  className={`flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${i < arr.length - 1 ? 'border-b border-border/50' : ''}`}
                  onClick={() => { triggerHaptic('light'); setTheme(value); }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary">
                      <Icon size={18} />
                    </div>
                    <span className="font-medium text-[15px]">{label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 transition-all ${theme === value ? 'border-accent scale-110' : 'border-border'}`}>
                    {theme === value && <div className="w-full h-full rounded-full bg-accent scale-50" />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── About / Version ──────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-2">About</h2>
            <div className="glass rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
              <button
                onClick={() => { triggerHaptic('light'); router.push('/about'); }}
                className="w-full flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary">
                    <Info size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-[15px]">About SatyaLabel</div>
                    <div className="text-[12px] text-text-muted">Version {APP_VERSION} · SIH26034</div>
                  </div>
                </div>
                <div className="text-text-muted font-bold text-[14px]">›</div>
              </button>
            </div>
          </section>

          {/* ── Sign Out ─────────────────────────────────────────── */}
          <section className="mt-2">
            <div className="glass rounded-[24px] border border-red-500/20 overflow-hidden shadow-sm flex items-center justify-between p-5 bg-red-500/5">
              <div>
                <h2 className="text-[15px] font-medium text-red-600 dark:text-red-400 mb-1">Sign Out</h2>
                <p className="text-[13px] text-red-600/70 dark:text-red-400/70">Clear session and lock app.</p>
              </div>
              <button
                onClick={() => { triggerHaptic('medium'); handleLogout(); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-medium rounded-[12px] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}