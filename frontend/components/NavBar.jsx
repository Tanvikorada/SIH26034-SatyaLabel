"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setEmail(localStorage.getItem('email') || 'Officer');
    setRole(localStorage.getItem('role') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload Scan', path: '/upload' },
    { name: 'History', path: '/history' },
    ...(role === 'admin' ? [{ name: 'Rules Config', path: '/rules' }] : [])
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="bg-navy-900 text-surface-alt sticky top-0 z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-accent" strokeWidth={1.75} />
            <span className="text-xl tracking-tight">
              <span className="font-bold">SATYA</span><span className="text-accent font-medium">LABEL</span>
            </span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                    pathname === link.path 
                      ? 'bg-navy-700 text-white border-b-2 border-accent' 
                      : 'text-text-muted hover:bg-navy-700 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-text-muted">
              ID: <span className="font-mono text-surface-alt">{email.split('@')[0].toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-accent hover:text-accent-soft font-medium">
              Logout
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-text-muted hover:text-white p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-navy-700 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-sm text-base font-medium ${
                pathname === link.path 
                  ? 'bg-navy-900 text-white border-l-4 border-accent' 
                  : 'text-text-muted hover:bg-navy-900 hover:text-white border-l-4 border-transparent'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full text-left block px-3 py-2 rounded-sm text-base font-medium text-accent hover:bg-navy-900"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
