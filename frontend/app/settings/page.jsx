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
    
    // PWA Install Logic
    let deferredPrompt;
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.onclick = async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
          }
        };
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    const isStandalone = () => {
      return ('standalone' in window.navigator) && window.navigator.standalone;
    };
    
    const installBtn = document.getElementById('install-pwa-btn');
    if (installBtn && isIos() && !isStandalone()) {
       installBtn.onclick = () => setShowIosPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [router]);

  
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-text-primary selection:bg-surface selection:text-text-primary">
      <NavBar />
      
      <main className="flex-1 w-full max-w-[800px] mx-auto p-6 md:p-12">
        {showIosPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl relative">
              <button onClick={() => setShowIosPrompt(false)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">✕</button>
              <h3 className="text-lg font-medium mb-3">Install on iOS</h3>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                To install SatyaLabel as an app on your iPhone or iPad:
              </p>
              <ol className="list-decimal pl-5 text-sm text-text-secondary space-y-2 mb-6">
                <li>Tap the <strong>Share</strong> icon <span className="inline-block border border-border px-1.5 py-0.5 rounded ml-1 bg-background">↑</span> at the bottom of Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong> <span className="inline-block border border-border px-1.5 py-0.5 rounded ml-1 bg-background">+</span>.</li>
              </ol>
              <button onClick={() => setShowIosPrompt(false)} className="w-full py-2.5 bg-primary text-background rounded-xl font-medium">Got it</button>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-medium tracking-tight mb-8">Settings</h1>
        
        <div className="space-y-6">
          <section className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
            <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
              Appearance
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 flex flex-col items-center justify-center gap-3 rounded-xl border transition-all ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-text-secondary hover:border-text-muted'}`}
              >
                <Sun size={24} />
                <span className="text-sm font-medium">Light</span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 flex flex-col items-center justify-center gap-3 rounded-xl border transition-all ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-text-secondary hover:border-text-muted'}`}
              >
                <Moon size={24} />
                <span className="text-sm font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-4 flex flex-col items-center justify-center gap-3 rounded-xl border transition-all ${theme === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background text-text-secondary hover:border-text-muted'}`}
              >
                <Monitor size={24} />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </section>

          
          <section className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium mb-1">Install SatyaLabel</h2>
              <p className="text-sm text-text-secondary">Install the app on your device for offline capabilities and faster access.</p>
            </div>
            <button 
              id="install-pwa-btn"
              className="px-5 py-2.5 bg-primary text-background hover:opacity-90 font-medium rounded-xl transition-opacity flex items-center gap-2 whitespace-nowrap"
            >
              <Monitor size={16} />
              Install as App
            </button>
          </section>

          
          <section className="p-6 rounded-2xl bg-surface border border-[var(--color-border)] shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-medium mb-1">Preferences</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Manage your app experience.</p>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"><Bell size={18} /></div>
                <div>
                  <div className="font-medium text-[15px]">Push Notifications</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Receive alerts for new rules</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={(e) => { setNotifications(e.target.checked); toast.success(e.target.checked ? 'Push notifications enabled' : 'Push notifications disabled'); }} />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)] border border-[var(--color-border)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"><Shield size={18} /></div>
                <div>
                  <div className="font-medium text-[15px]">Data & Privacy</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Manage telemetry and logs</div>
                </div>
              </div>
              <button onClick={() => toast.info('Telemetry and diagnostic logs are managed by your department administrator.')} className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] active-press">Manage</button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]"><Info size={18} /></div>
                <div>
                  <div className="font-medium text-[15px]">About SatyaLabel</div>
                  <div className="text-[12px] text-[var(--color-text-muted)]">Version 2.0.4 (Enterprise Build)</div>
                </div>
              </div>
              <button onClick={() => toast.success('SatyaLabel Legal Metrology Engine v2.0.4 (Enterprise Build). All core OCR systems operational.')} className="text-[13px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] active-press">View Details</button>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-surface border border-border shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium mb-1">Account</h2>
              <p className="text-sm text-text-secondary">Manage your session.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </section>


        </div>
        
        <div className="mt-12 text-center text-[13px] text-[var(--color-text-muted)] flex flex-col items-center gap-2">
          <p>Smart India Hackathon 2026</p>
          <p className="font-medium">Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by Tanvi</p>
        </div>
      </main>

    </div>
  );
}
