"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

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
    ...(role === 'admin' ? [{ name: 'Rules Config', path: '/rules' }] : [])
  ];

  if (pathname === '/login') return null;

  return (
    <div className="w-full">
      {/* Announcement Band */}
      <div className="w-full bg-iris-pulse py-[10px] px-[24px] flex justify-between items-center">
        <div className="text-canvas text-[13px] font-medium text-center w-full">
          SIH26034 v2.0 deployed. All scans now processed via Edge OCR.
        </div>
        <button className="btn-pill shrink-0 whitespace-nowrap">View docs →</button>
      </div>
      
      {/* Navigation */}
      <nav className="w-full bg-canvas border-b border-obsidian-ink/15 h-[64px] flex items-center justify-between px-[24px]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-[8px] h-[8px] rounded-full bg-obsidian-ink"></div>
          <span className="font-bold text-[16px] tracking-[-0.02em] text-obsidian-ink">satyalabel</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex gap-8">
          {links.map(l => (
            <Link key={l.name} href={l.path} className={	ext-[14px]  text-obsidian-ink}>
              {l.name}
            </Link>
          ))}
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <span className="text-[14px] text-fog">{email}</span>
          <button onClick={handleLogout} className="btn-ghost !py-[8px] !px-[18px] !text-[14px]">Log out</button>
        </div>
      </nav>
    </div>
  );
}
