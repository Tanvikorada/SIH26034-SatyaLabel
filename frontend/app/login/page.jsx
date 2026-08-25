"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = (role) => {
    // Mock SSO
    localStorage.setItem('token', 'mock-sso-token');
    localStorage.setItem('email', `${role.toLowerCase().replace(' ', '')}@satyalabel.gov.in`);
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090d16] text-white p-4 overflow-hidden">
      <div className="orb-saffron top-1/4 left-1/4 w-96 h-96"></div>
      <div className="orb-blue bottom-1/4 right-1/4 w-96 h-96"></div>

      <div className="glass rounded-2xl p-10 max-w-md w-full relative z-10 animate-fade-in shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full gradient-accent-bg flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-center">Sign In to SatyaLabel</h1>
          <p className="text-[var(--text-secondary)] mt-2">Compliance & Verification Portal</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button 
            className={`flex-1 btn ${tab === 'login' ? 'btn-secondary border-[var(--accent)]' : 'btn-ghost'}`}
            onClick={() => setTab('login')}
          >
            Officer Login
          </button>
          <button 
            className={`flex-1 btn ${tab === 'register' ? 'btn-secondary border-[var(--accent)]' : 'btn-ghost'}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-[var(--fail)] text-sm text-center">{error}</div>}
          <div className="input-group">
            <div className="input-group-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <input 
              type="email" 
              placeholder="Email address" 
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <div className="input-group-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input 
              type="password" 
              placeholder="Password" 
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-right">
            <a href="#" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="my-8">
          <div className="divider-label">or quick access</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="sso-btn" onClick={() => handleSSO('Field Officer')}>
            <span className="text-xl">👮</span> Field Officer
          </button>
          <button className="sso-btn" onClick={() => handleSSO('Inspector')}>
            <span className="text-xl">🔍</span> Inspector
          </button>
          <button className="sso-btn" onClick={() => handleSSO('Analyst')}>
            <span className="text-xl">📊</span> Analyst
          </button>
          <button className="sso-btn" onClick={() => handleSSO('Admin')}>
            <span className="text-xl">⚙️</span> Admin
          </button>
        </div>

        <div className="text-center text-xs text-[var(--text-faint)] mt-4">
          Ministry of Consumer Affairs &middot; SIH26034
        </div>
      </div>
    </div>
  );
}
