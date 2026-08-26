"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import NavBar from '@/components/NavBar';
import { LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  
  useEffect(() => {
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.onclick = async () => {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        };
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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

  if (!mounted) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-text-primary selection:bg-surface selection:text-text-primary">
      <NavBar />
      
      <main className="flex-1 w-full max-w-[800px] mx-auto p-6 md:p-12">
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
      </main>
    </div>
  );
}
