"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ScanLine, Clock, ShieldAlert, Shield, FileText, Settings, LogOut, Menu, X } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem('email') || 'officer@gov.in');
    setRole(sessionStorage.getItem('role') || '');
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    router.push('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Scan Upload', path: '/upload', icon: <ScanLine size={18} /> },
    { name: 'Scan History', path: '/history', icon: <Clock size={18} /> },
    ...(role === 'admin' ? [
      { name: 'Rules Engine', path: '/rules', icon: <ShieldAlert size={18} /> },
      { name: 'Admin Hub', path: '/admin', icon: <Shield size={18} /> },
      { name: 'Public Grievances', path: '/reports', icon: <FileText size={18} /> },
      { name: 'Settings', path: '/settings', icon: <Settings size={18} /> }
    ] : [])
  ];

  if (pathname === '/login') return null;

  return (
    <>
      <nav className="w-full h-[72px] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 bg-[#1E3A8A] shadow-lg border-b border-[#162d6e]">
        
        {/* Left: Government Branding */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group z-50">
          <div className="flex items-center justify-center shrink-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
              alt="State Emblem of India" 
              className="h-10 sm:h-11 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex flex-col justify-center mt-0.5">
            <span className="hidden sm:flex text-[10px] sm:text-[11px] font-sans tracking-wide text-white/80 uppercase mb-0.5 font-medium items-center gap-1.5">
              <span>सत्यमेव जयते</span>
              <span className="w-1 h-1 rounded-full bg-white/50"></span>
              <span>Dept. of Consumer Affairs</span>
            </span>
            <span className="font-semibold tracking-tight text-[16px] sm:text-[18px] text-white leading-none flex items-baseline gap-1.5">
              SatyaLabel <span className="hidden sm:inline font-normal text-white/70 text-[15px]">Legal Metrology</span>
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) - Removed horizontal scroll */}
        <div className="hidden xl:flex items-center justify-center flex-1 px-4 z-50">
          <div className="flex items-center gap-2">
            {links.map(l => {
              const isActive = pathname === l.path || pathname.startsWith(l.path + '/');
              return (
                <Link 
                  key={l.name} 
                  href={l.path} 
                  className={`text-[13px] font-medium px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-white/15 text-white shadow-inner' 
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right Side: Profile & Logout (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 shrink-0 ml-auto z-50">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              {email ? email.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[12px] font-medium leading-none mb-0.5">{email}</span>
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider leading-none">{role === 'admin' ? 'Administrator' : 'Field Officer'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 py-2 px-5 text-[13px] font-bold rounded-full transition-all shadow-sm">
            Sign Out
          </button>
        </div>

        {/* Right Side: Mobile Hamburger */}
        <div className="xl:hidden flex items-center gap-3 shrink-0 z-50">
          <button onClick={handleLogout} className="hidden sm:block bg-white/10 hover:bg-white/20 text-white border border-white/20 py-1.5 px-3 text-[12px] font-semibold rounded-full transition-all">
            Log out
          </button>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className={`p-2 rounded-md transition-colors ${menuOpen ? 'bg-white/20 text-white' : 'bg-transparent text-white hover:bg-white/10'}`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Smooth Mobile Dropdown Container */}
      <div 
        className={`xl:hidden fixed inset-0 z-40 flex flex-col pointer-events-none`}
        style={{ top: '72px' }}
      >
        {/* Backdrop (Fades in) */}
        <div 
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
            menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Menu Panel (Slides down smoothly) */}
        <div 
          className={`relative w-full bg-[#1E3A8A] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto flex flex-col max-h-[85vh] origin-top border-b border-[#162d6e] ${
            menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          {/* User Profile Header */}
          <div className="flex items-center gap-4 p-5 border-b border-white/10 bg-black/10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-bold shadow-sm border border-white/20">
              {email ? email.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm mb-1">{email}</span>
              <span className="text-blue-200 text-[11px] uppercase tracking-wider font-bold">{role === 'admin' ? 'Administrator' : 'Field Officer'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col py-2 overflow-y-auto custom-scrollbar">
            {links.map((l, i) => {
              const isActive = pathname === l.path || pathname.startsWith(l.path + '/');
              return (
                <Link 
                  key={l.name} 
                  href={l.path} 
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    isActive 
                      ? 'bg-white/10 text-white border-l-4 border-white' 
                      : 'text-blue-100 hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-blue-300'}>{l.icon}</span>
                  <span className="font-medium text-[15px]">{l.name}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Footer Logout */}
          <div className="p-5 border-t border-white/10 bg-black/5">
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-lg font-bold transition-colors shadow-md">
              <LogOut size={18} />
              Secure Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
