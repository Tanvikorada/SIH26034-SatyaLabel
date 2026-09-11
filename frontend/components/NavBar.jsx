"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ScanLine, Clock, ShieldAlert, Shield, FileText, Settings, LogOut, ChevronRight, X, Menu } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setEmail(sessionStorage.getItem('email') || 'officer@gov.in');
    setRole(sessionStorage.getItem('role') || '');
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      <nav className="w-full h-[calc(72px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 bg-[#1E3A8A] shadow-md border-b border-[#162d6e] transition-all">
        
        {/* Left: Government Branding */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0 group">
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

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden xl:flex items-center justify-center flex-1 min-w-0 px-2 overflow-x-auto no-scrollbar mask-edges">
          <div className="flex items-center gap-1 2xl:gap-2">
            {links.map(l => {
              const isActive = pathname === l.path || pathname.startsWith(l.path + '/');
              return (
                <Link 
                  key={l.name} 
                  href={l.path} 
                  className={`text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-white/15 text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]' 
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
        <div className="hidden xl:flex items-center gap-3 shrink-0 ml-auto">
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
        <div className="xl:hidden flex items-center gap-3 shrink-0">
          <button onClick={handleLogout} className="hidden sm:block bg-white/10 hover:bg-white/20 text-white border border-white/20 py-1.5 px-3 text-[12px] font-semibold rounded-full transition-all">
            Log out
          </button>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors shadow-sm"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Premium Mobile Menu Drawer */}
      {menuOpen && (
        <div className="xl:hidden fixed inset-0 z-[100] flex justify-end">
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0B1F3A]/70 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => setMenuOpen(false)}
          ></div>
          
          {/* Sliding Glass Drawer */}
          <div className="relative w-[85%] max-w-sm h-full bg-[#0A1628]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="font-bold text-xl text-white tracking-wide">Menu</span>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-sm active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Section */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
              <span className="text-orange-400 text-[10px] uppercase font-bold tracking-[0.15em] mb-4 block opacity-80">Active Session</span>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg border border-orange-400/50">
                  {email ? email.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg mb-0.5 truncate max-w-[180px]">{email}</span>
                  <span className="text-emerald-400 text-xs font-bold tracking-wider">{role === 'admin' ? 'System Administrator' : 'Field Officer'}</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {links.map((l, index) => {
                const isActive = pathname === l.path || pathname.startsWith(l.path + '/');
                return (
                  <Link 
                    key={l.name} 
                    href={l.path} 
                    className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                      isActive 
                        ? 'bg-orange-500/15 border border-orange-500/30 text-white shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                        : 'border border-transparent text-white/60 hover:bg-white/5 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/15'
                      }`}>
                        {l.icon}
                      </div>
                      <span className="font-semibold text-[15px]">{l.name}</span>
                    </div>
                    <ChevronRight size={18} className={isActive ? 'text-orange-400' : 'text-white/20 group-hover:text-white/50 transition-colors'} />
                  </Link>
                )
              })}
            </div>
            
            {/* Footer Logout */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all shadow-[0_4px_20px_rgba(239,68,68,0.3)] active:scale-[0.98]">
                <LogOut size={18} />
                Secure Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
