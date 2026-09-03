"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import NavBar from '@/components/NavBar';
import { LogOut, Moon, Sun, Monitor, Bell, Shield, Info, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20">
      <NavBar />
      
      <main className="max-w-[700px] mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade-in">
        <h1 className="text-[28px] md:text-[32px] font-semibold tracking-tight leading-[1.1] mb-2">Settings</h1>
        <p className="text-[15px] text-text-secondary mb-10">Manage your application preferences and account.</p>

        <div className="flex flex-col gap-8">
          
          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-2">Appearance</h2>
            <div className="glass rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-border/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { triggerHaptic(); setTheme('light'); }}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary"><Sun size={18} /></div>
                  <span className="font-medium text-[15px]">Light Mode</span>
                </div>
                <div className={`w-5 h-5 rounded-full border ${theme === 'light' ? 'border-accent border-[5px]' : 'border-border'}`}></div>
              </div>
              <div className="flex items-center justify-between p-5 border-b border-border/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { triggerHaptic(); setTheme('dark'); }}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary"><Moon size={18} /></div>
                  <span className="font-medium text-[15px]">Dark Mode</span>
                </div>
                <div className={`w-5 h-5 rounded-full border ${theme === 'dark' ? 'border-accent border-[5px]' : 'border-border'}`}></div>
              </div>
              <div className="flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { triggerHaptic(); setTheme('system'); }}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary"><Monitor size={18} /></div>
                  <span className="font-medium text-[15px]">System Match</span>
                </div>
                <div className={`w-5 h-5 rounded-full border ${theme === 'system' ? 'border-accent border-[5px]' : 'border-border'}`}></div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[13px] font-bold tracking-widest uppercase text-text-muted px-2">System</h2>
            <div className="glass rounded-[24px] border border-border/50 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary"><Bell size={18} /></div>
                  <div>
                    <div className="font-medium text-[15px]">Push Notifications</div>
                    <div className="text-[12px] text-text-muted">Receive scan completion alerts</div>
                  </div>
                </div>
                <button 
                  onClick={() => { triggerHaptic(); setNotifications(!notifications); }}
                  className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-emerald-500' : 'bg-border'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-background rounded-xl border border-border shadow-sm text-text-secondary"><Info size={18} /></div>
                  <div>
                    <div className="font-medium text-[15px]">About SatyaLabel</div>
                    <div className="text-[12px] text-text-muted">Version 2.5.0 (Enterprise Build)</div>
                  </div>
                </div>
                <button onClick={() => toast.success('SatyaLabel Enterprise v2.5.0')} className="text-[13px] font-bold text-accent">View Details</button>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <div className="glass rounded-[24px] border border-red-500/20 overflow-hidden shadow-sm flex items-center justify-between p-5 bg-red-500/5">
              <div>
                <h2 className="text-[15px] font-medium text-red-600 dark:text-red-400 mb-1">Sign Out</h2>
                <p className="text-[13px] text-red-600/70 dark:text-red-400/70">Clear session and lock app.</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-[12px] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Sign Out
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}