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
    <div className="min-h-screen bg-midnight flex items-center justify-center p-6 text-white font-sans selection:bg-white selection:text-midnight">
      <div className="w-full max-w-[440px] mello-card p-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-midnight"></div>
          </div>
          <span className="font-medium tracking-tight text-[15px]">satyalabel</span>
        </div>
        
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-3">Sign in</h1>
        <p className="text-[15px] text-mist mb-8">Enter your credentials to access the compliance dashboard.</p>

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

        <div className="border-t border-graphite pt-6">
          <p className="text-[13px] font-medium text-mist mb-3 text-center">Quick demo access</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleQuickLogin('officer@gov.in')} className="mello-btn-secondary !py-2">Field Officer</button>
            <button type="button" onClick={() => handleQuickLogin('admin@gov.in')} className="mello-btn-secondary !py-2">System Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
