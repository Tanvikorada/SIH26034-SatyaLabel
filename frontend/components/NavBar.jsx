"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setEmail(localStorage.getItem('email') || 'Officer');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Upload Scan', path: '/upload' },
    { name: 'History', path: '/history' },
    { name: 'Rules Config', path: '/rules' }
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#059669]" />
            <span className="font-bold text-xl tracking-tight">SatyaLabel Enforcement</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.path 
                      ? 'bg-[#1e293b] text-white' 
                      : 'text-gray-300 hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-gray-300">
              ID: <span className="font-mono text-white">{email.split('@')[0].toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300 font-medium">
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1e293b] px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.path 
                  ? 'bg-[#0f172a] text-white' 
                  : 'text-gray-300 hover:bg-[#0f172a] hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-[#0f172a]"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
