"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SplitText from '@/components/SplitText';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Authenticating credentials...');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
        localStorage.setItem('role', email.includes('admin') ? 'admin' : 'officer');
        toast.success('Login Successful', { id: toastId, description: 'Welcome to SatyaLabel.' });
        router.push('/dashboard');
      } else {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('email', email);
        localStorage.setItem('role', email.includes('admin') ? 'admin' : 'officer');
        toast.warning('Demo Mode Active', { id: toastId, description: 'Authentication failed. Falling back to offline mode.' });
        router.push('/dashboard');
      }
    } catch (err) {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('email', email);
      toast.warning('Network Offline', { id: toastId, description: 'Backend unreachable. Activating offline mode.' });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const setQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background blobs for a higher-quality look */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <SplitText
            text="SatyaLabel"
            className="text-4xl font-black text-navy-900 tracking-tight"
            delay={50}
            duration={1}
            tag="h1"
          />
          <p className="text-text-muted text-sm uppercase tracking-wide mt-2">Compliance Intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Officer ID / Email</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-all bg-white"
              placeholder="officer@gov.in"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-all bg-white"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-navy-900 hover:bg-navy-700 text-white rounded-lg py-6 text-md font-bold mt-4 shadow-lg shadow-navy-900/20">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center mb-4">Quick Access Roles</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setQuickLogin('field.officer@gov.in')} className="rounded-lg h-auto py-3 text-navy-900 border-gray-200 hover:bg-navy-50">
              <span className="text-sm">Field Officer</span>
            </Button>
            <Button variant="outline" onClick={() => setQuickLogin('inspector@gov.in')} className="rounded-lg h-auto py-3 text-navy-900 border-gray-200 hover:bg-navy-50">
              <span className="text-sm">Inspector</span>
            </Button>
            <Button variant="outline" onClick={() => setQuickLogin('analyst@gov.in')} className="rounded-lg h-auto py-3 text-navy-900 border-gray-200 hover:bg-navy-50">
              <span className="text-sm">Analyst</span>
            </Button>
            <Button variant="outline" onClick={() => setQuickLogin('admin@gov.in')} className="rounded-lg h-auto py-3 text-navy-900 border-gray-200 hover:bg-navy-50">
              <span className="text-sm">Admin</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
