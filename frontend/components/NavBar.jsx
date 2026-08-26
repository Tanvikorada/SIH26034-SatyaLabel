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

  useEffect(() => {
    setEmail(localStorage.getItem('email') || 'officer@gov.in');
    setRole(localStorage.getItem('role') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload Scan', path: '/upload' },
    { name: 'History', path: '/history' },
    ...(role === 'admin' ? [{ name: 'Rules Config', path: '/rules' }] : []),
    { name: 'Settings', path: '/settings' }
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="w-full bg-background border-b border-border h-[64px] flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <span className="font-bold tracking-tight text-[18px] text-text-primary">SatyaLabel</span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6">
        {links.map(l => (
          <Link key={l.name} href={l.path} className={`text-[14px] transition-colors ${pathname.includes(l.path) ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary'}`}>
            {l.name}
          </Link>
        ))}
      </div>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-[13px] text-text-muted">{email}</span>
        <button onClick={handleLogout} className="mello-btn-secondary !py-1.5 !px-3 !text-[13px] !rounded-full">Log out</button>
      </div>

      {/* Mobile Hamburger Icon */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-text-secondary focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-background border-b border-border flex flex-col p-4 shadow-lg md:hidden">
          {links.map(l => (
            <Link key={l.name} href={l.path} onClick={() => setMenuOpen(false)} className={`py-3 px-4 text-[15px] border-b border-border transition-colors ${pathname.includes(l.path) ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
              {l.name}
            </Link>
          ))}
          <div className="py-4 px-4 flex justify-between items-center mt-2">
             <span className="text-[13px] text-text-muted font-medium">{email}</span>
             <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="mello-btn-secondary !py-1.5 !px-4 !text-[13px] !rounded-full">Log out</button>
          </div>
        </div>
      )}
    </nav>
  );
}
