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
    <nav className="w-full bg-midnight/80 backdrop-blur-md border-b border-graphite h-[64px] flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-midnight"></div>
        </div>
        <span className="font-medium tracking-tight text-[15px] text-white">satyalabel</span>
      </div>

      <div className="hidden md:flex gap-6">
        {links.map(l => (
          <Link key={l.name} href={l.path} className={`text-[14px] transition-colors ${pathname.includes(l.path) ? 'text-white font-medium' : 'text-mist hover:text-white'}`}>
            {l.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[13px] text-fog hidden md:block">{email}</span>
        <button onClick={handleLogout} className="mello-btn-secondary !py-1.5 !px-3 !text-[13px] !rounded-full">Log out</button>
      </div>
    </nav>
  );
}
