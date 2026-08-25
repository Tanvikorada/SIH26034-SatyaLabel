"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) setUserEmail(email);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload', path: '/upload' },
    { name: 'History', path: '/history' },
    { name: 'Rules', path: '/rules' },
  ];

  return (
    <nav className={`navbar transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-accent-bg flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.4)]">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">SatyaLabel</span>
            <span className="badge badge-accent hidden sm:inline-flex text-[10px]">v2</span>
          </div>

          {/* Center: Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className={`navbar-link ${pathname.startsWith(link.path) ? 'active text-white' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="badge badge-pass"><span className="badge-dot bg-current"></span>Online</span>
            </div>
            {userEmail && (
              <div className="w-8 h-8 rounded-full bg-[var(--bg-raised)] border border-[var(--border-bright)] flex items-center justify-center text-sm font-semibold uppercase text-[var(--accent)]">
                {userEmail.charAt(0)}
              </div>
            )}
            <button onClick={handleLogout} className="btn btn-ghost text-sm py-1 px-3">
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[var(--text-secondary)] hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass absolute top-[var(--nav-h)] left-0 w-full border-t border-[var(--glass-border)] animate-fade-in-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname.startsWith(link.path) 
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-[var(--border-muted)]">
               <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-[var(--fail)] hover:bg-[var(--fail-bg)] rounded-md">
                 Logout
               </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
