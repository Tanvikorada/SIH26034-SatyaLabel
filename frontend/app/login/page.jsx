"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Authenticating...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
        localStorage.setItem('role', email.includes('admin') ? 'admin' : 'officer');
        toast.success('Login Successful', { id: toastId });
        router.push('/dashboard');
      }
    } catch (err) {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('email', email);
      localStorage.setItem('role', email.includes('admin') ? 'admin' : 'officer');
      toast.warning('Network Offline', { id: toastId, description: 'Entering Demo Mode.' });
      router.push('/dashboard');
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6 text-text-primary font-sans selection:bg-accent/30">
      {/* Ambient Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
      
      {/* Glass Panel */}
      <div className="w-full max-w-[440px] glass backdrop-blur-3xl border border-border/50 shadow-2xl rounded-[32px] p-8 sm:p-12 z-10 animate-fade-in relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[32px] pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center shadow-lg shadow-accent/20 border border-white/20">
            <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-[22px]">SatyaLabel</span>
        </div>
        
        <h1 className="text-[32px] font-semibold tracking-tight leading-[1.1] mb-2 relative z-10">Sign in</h1>
        <p className="text-[15px] text-text-secondary mb-8 relative z-10">Enter your credentials to access the compliance dashboard.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-8 relative z-10">
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full bg-black/10 dark:bg-white/5 border border-border/50 rounded-[16px] px-5 py-4 text-[15px] focus:outline-none focus:border-accent transition-colors backdrop-blur-sm" 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-black/10 dark:bg-white/5 border border-border/50 rounded-[16px] px-5 py-4 text-[15px] focus:outline-none focus:border-accent transition-colors backdrop-blur-sm" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-text-primary text-background hover:scale-[1.02] active:scale-[0.98] transition-transform rounded-[16px] px-5 py-4 font-semibold text-[15px] mt-4 shadow-xl" disabled={loading}>
            {loading ? 'Authenticating...' : 'Continue'}
          </button>
        </form>

        <div className="border-t border-border/50 pt-8 relative z-10">
          <p className="text-[12px] font-semibold tracking-widest uppercase text-text-muted mb-4 text-center">Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => handleQuickLogin('officer@gov.in')} className="glass border border-border/50 rounded-[12px] py-3 text-[13px] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm">Field Officer</button>
            <button type="button" onClick={() => handleQuickLogin('admin@gov.in')} className="glass border border-border/50 rounded-[12px] py-3 text-[13px] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm">System Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}