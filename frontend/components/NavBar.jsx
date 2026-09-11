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
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Scan', path: '/upload' },
    { name: 'History', path: '/history' },
    ...(role === 'admin' ? [
      { name: 'Rules', path: '/rules' },
      { name: 'Admin', path: '/admin' },
      { name: 'Reports', path: '/reports' },
        { name: 'Settings', path: '/settings' }
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
              <span>उपभोक्ता मामले विभाग</span>
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

        {/* Right Side: Mobile Hamburger & Logout */}
        <div className="xl:hidden flex items-center gap-3 shrink-0">
          <button onClick={handleLogout} className="hidden sm:block bg-white/10 hover:bg-white/20 text-white border border-white/20 py-1.5 px-3 text-[12px] font-semibold rounded-full transition-all">
            Log out
          </button>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm pt-[calc(72px+env(safe-area-inset-top))]">
          <div className="bg-[#1E3A8A] w-full border-t border-[#162d6e] shadow-2xl animate-fade-in flex flex-col">
            <div className="flex flex-col p-4 border-b border-white/10">
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">Logged in as</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[14px] font-bold">
                  {email ? email.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[14px] font-medium leading-none mb-1">{email}</span>
                  <span className="text-emerald-400 text-[11px] font-bold tracking-wider leading-none">{role === 'admin' ? 'Administrator' : 'Field Officer'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-2">
              {links.map(l => {
                const isActive = pathname === l.path || pathname.startsWith(l.path + '/');
                return (
                  <Link 
                    key={l.name} 
                    href={l.path} 
                    className={`text-[15px] font-medium px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-white/15 text-white' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {l.name}
                  </Link>
                )
              })}
            </div>
            <div className="p-4 sm:hidden">
              <button onClick={handleLogout} className="w-full bg-red-500/80 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



