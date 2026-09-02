const fs = require('fs');

const navCode = `"use client";
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
    <nav className="w-full h-[64px] flex items-center justify-between px-6 sticky top-0 z-50 bg-[#1E3A8A] shadow-[0_4px_20px_rgba(30,58,138,0.3)] transition-colors duration-500 border-b border-[#1E3A8A]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center shadow-sm relative shrink-0">
          <div className="absolute inset-0 rounded-full border-[0.5px] border-white/10 m-1"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white z-10">
            <path d="M12 3v18"></path>
            <path d="M3 8h18"></path>
            <path d="M5 8v6a2 2 0 0 0 4 0V8"></path>
            <path d="M15 8v6a2 2 0 0 0 4 0V8"></path>
            <path d="M8 21h8"></path>
            <circle cx="12" cy="3" r="1"></circle>
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-mono tracking-[0.15em] text-white/70 uppercase leading-none mb-1">Dept. of Consumer Affairs</span>
          <span className="font-semibold tracking-tight text-[17px] text-white leading-none">SatyaLabel <span className="font-normal text-white/80 text-[15px]">Legal Metrology</span></span>
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-6">
        {links.map(l => (
          <Link key={l.name} href={l.path} className={\`text-[14px] transition-colors \${pathname.includes(l.path) ? 'text-white font-semibold' : 'text-white/70 hover:text-white'}\`}>
            {l.name}
          </Link>
        ))}
      </div>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-[13px] text-white/70">{email}</span>
        <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 !py-1.5 !px-3 !text-[13px] !rounded-full transition-colors">Log out</button>
      </div>

      {/* Hamburger Removed for Mobile Bottom Nav */}
    </nav>
  );
}
`;
fs.writeFileSync('frontend/components/NavBar.jsx', navCode);

let pageCode = fs.readFileSync('frontend/app/page.jsx', 'utf8');

// Replace the landing page nav
const landingNavRegex = /<nav className="w-full flex items-center justify-between px-6 py-3 md:px-12 relative z-20 sticky top-0 bg-slate-50\/90 dark:bg-slate-900\/90 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-500">[\s\S]*?<\/nav>/;
const newLandingNav = `<nav className="w-full flex items-center justify-between px-6 py-3 md:px-12 relative z-20 sticky top-0 bg-[#1E3A8A] shadow-[0_4px_20px_rgba(30,58,138,0.3)] border-b border-[#1E3A8A] transition-colors duration-500">
        <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center shadow-sm relative shrink-0">
          <div className="absolute inset-0 rounded-full border-[0.5px] border-white/10 m-1"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white z-10">
            <path d="M12 3v18"></path>
            <path d="M3 8h18"></path>
            <path d="M5 8v6a2 2 0 0 0 4 0V8"></path>
            <path d="M15 8v6a2 2 0 0 0 4 0V8"></path>
            <path d="M8 21h8"></path>
            <circle cx="12" cy="3" r="1"></circle>
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-mono tracking-[0.15em] text-white/70 uppercase leading-none mb-1">Dept. of Consumer Affairs</span>
          <span className="font-semibold tracking-tight text-[17px] text-white leading-none">SatyaLabel <span className="font-normal text-white/80 text-[15px]">Legal Metrology</span></span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-[13px] font-medium text-white/80 hover:text-white transition-colors">Officer Login</Link>
        <Link href="/login" className="bg-white text-[#1E3A8A] hover:bg-white/90 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm transition-all hidden sm:block">Access Console</Link>
      </div>
</nav>`;

if (pageCode.match(landingNavRegex)) {
  pageCode = pageCode.replace(landingNavRegex, newLandingNav);
  fs.writeFileSync('frontend/app/page.jsx', pageCode);
  console.log("LANDING PAGE NAV UPDATED");
} else {
  console.log("LANDING PAGE NAV NOT FOUND");
}
