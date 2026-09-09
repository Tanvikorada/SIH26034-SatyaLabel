"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem('email') || 'officer@gov.in');
    setRole(sessionStorage.getItem('role') || '');
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    router.push('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload Scan', path: '/upload' },
    { name: 'History', path: '/history' },
    ...(role === 'admin' ? [
      { name: 'Rules Config', path: '/rules' },
      { name: 'Public Grievances', path: '/admin/reports' }
    ] : []),
    { name: 'Settings', path: '/settings' }
  ];

  if (pathname === '/login' || pathname === '/report') return null;

  return (
    <nav className={`w-full h-[calc(64px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-lg' : 'bg-transparent border-b border-transparent'}`}>
      
      {/* Logo Area */}
      <Link href="/dashboard" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold tracking-tight text-[17px] text-text-primary leading-none group-hover:text-accent transition-colors">SatyaLabel <span className="font-medium text-text-muted text-[15px]">v2</span></span>
          <span className="text-[10px] font-sans tracking-[0.05em] text-text-secondary uppercase mt-1 font-medium">Dept. of Consumer Affairs</span>
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-1 bg-surface/50 glass px-2 py-1.5 rounded-full border border-border">
        {links.map(l => {
          const isActive = pathname.includes(l.path);
          return (
            <Link key={l.name} href={l.path} className={`text-[13px] font-semibold px-4 py-2 rounded-full transition-all ${isActive ? 'bg-background text-accent shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'}`}>
              {l.name}
            </Link>
          );
        })}
      </div>

      {/* Right Side: Profile & Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Profile */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-bold text-text-primary">{email.split('@')[0]}</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pass animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-wider text-pass uppercase">Online</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full glass border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/30 transition-all" title="Logout">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 text-text-secondary" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-[calc(64px+env(safe-area-inset-top))] left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border shadow-2xl p-4 md:hidden flex flex-col gap-2">
          {links.map(l => (
            <Link key={l.name} href={l.path} onClick={() => setMenuOpen(false)} className={`p-3 rounded-[12px] text-[15px] font-semibold ${pathname.includes(l.path) ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-surface'}`}>
              {l.name}
            </Link>
          ))}
          <button onClick={handleLogout} className="mt-4 p-3 rounded-[12px] text-[15px] font-bold bg-red-500/10 text-red-500 w-full text-left">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
