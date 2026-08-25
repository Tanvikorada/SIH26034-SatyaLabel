"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Search, Microscope, Briefcase } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        router.push('/dashboard');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      // Fallback for demo purposes
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('email', email);
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      
      <div className="w-full max-w-md gov-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#059669] rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a]">SatyaLabel Enforcement</h1>
          <p className="text-gray-500 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1">Officer Email / Gov ID</label>
            <input 
              type="text" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-[#0f172a]"
              placeholder="officer@gov.in"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-[#0f172a]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full gov-btn-accent mt-4">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-4">Quick Access Demo</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setQuickLogin('field.officer@gov.in')} className="gov-btn-outline flex flex-col items-center justify-center py-3">
              <Search className="w-5 h-5 mb-1 text-[#0f172a]" />
              <span className="text-xs">Field Officer</span>
            </button>
            <button onClick={() => setQuickLogin('inspector@gov.in')} className="gov-btn-outline flex flex-col items-center justify-center py-3">
              <ShieldCheck className="w-5 h-5 mb-1 text-[#059669]" />
              <span className="text-xs">Inspector</span>
            </button>
            <button onClick={() => setQuickLogin('analyst@gov.in')} className="gov-btn-outline flex flex-col items-center justify-center py-3">
              <Microscope className="w-5 h-5 mb-1 text-[#d97706]" />
              <span className="text-xs">Analyst</span>
            </button>
            <button onClick={() => setQuickLogin('admin@gov.in')} className="gov-btn-outline flex flex-col items-center justify-center py-3">
              <Briefcase className="w-5 h-5 mb-1 text-[#dc2626]" />
              <span className="text-xs">Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400 font-mono">
            Ministry of Consumer Affairs, Food & Public Distribution<br/>
            SIH26034 v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
