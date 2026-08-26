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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-text-primary font-sans selection:bg-surface selection:text-background">
      <div className="w-full max-w-[440px] mello-card p-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold tracking-tight text-[18px]">SatyaLabel</span>
        </div>
        
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-3">Sign in</h1>
        <p className="text-[15px] text-text-secondary mb-8">Enter your credentials to access the compliance dashboard.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-8">
          <input 
            type="email" 
            placeholder="Email address" 
            className="mello-input" 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="mello-input" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="mello-btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Authenticating...' : 'Continue'}
          </button>
        </form>

        <div className="border-t border-border pt-6">
          <p className="text-[13px] font-medium text-text-secondary mb-3 text-center">Quick demo access</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleQuickLogin('officer@gov.in')} className="mello-btn-secondary !py-2">Field Officer</button>
            <button type="button" onClick={() => handleQuickLogin('admin@gov.in')} className="mello-btn-secondary !py-2">System Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
