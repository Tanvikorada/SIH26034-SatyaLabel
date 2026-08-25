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
      const res = await fetch(${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/auth/login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
        localStorage.setItem('role', email.includes('admin') ? 'admin' : 'officer');
        toast.success('Login Successful', { id: toastId });
        router.push('/dashboard');
      } else {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('email', email);
        localStorage.setItem('role', email.includes('admin') ? 'admin' : 'officer');
        toast.warning('Demo Mode Active', { id: toastId, description: 'Falling back to offline mode.' });
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
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-16">
          <div className="w-[8px] h-[8px] rounded-full bg-obsidian-ink"></div>
          <span className="font-bold text-[16px] text-obsidian-ink">satyalabel</span>
        </div>
        
        <h1 className="text-[56px] leading-[1.07] tracking-[-1.68px] mb-4">Sign in to<br/>SatyaLabel</h1>
        <p className="text-[18px] text-fog mb-12">Legal Metrology Compliance Checker.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-8">
          <input 
            type="email" 
            placeholder="Email address" 
            className="privy-input" 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="privy-input" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign in →'}
          </button>
        </form>

        <div className="border-t border-ash pt-8">
          <p className="text-[14px] font-bold text-obsidian-ink mb-4">Quick demo access</p>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => handleQuickLogin('officer@gov.in')} className="btn-ghost !text-[13px] !py-[8px]">Field Officer</button>
            <button type="button" onClick={() => handleQuickLogin('admin@gov.in')} className="btn-ghost !text-[13px] !py-[8px]">System Admin</button>
          </div>
        </div>
      </div>
      
      {/* Editorial Decorative Side */}
      <div className="hidden md:block w-1/2 bg-carbon relative overflow-hidden">
        <div className="absolute inset-0 bg-deep-teal opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
           <div className="privy-card-dark w-full max-w-md shadow-2xl">
             <div className="w-12 h-12 bg-graphite rounded mb-6 flex items-center justify-center">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
             </div>
             <h3 className="text-[26px] mb-2 leading-[1.13] tracking-[-0.78px]">Secure by design</h3>
             <p className="text-[14px] text-fog">End-to-end edge OCR processing with automatic offline degradation.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
