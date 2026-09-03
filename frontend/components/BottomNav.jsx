"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ScanLine, Clock, Settings, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { triggerHaptic } from '@/utils/haptics';

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    setMounted(true);
    setRole(sessionStorage.getItem('role') || '');
  }, []);

  if (!mounted || pathname === '/login' || pathname === '/') return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] border-t border-[var(--color-border)] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 h-16">
        
        <Link onClick={() => triggerHaptic('light')} href="/dashboard" className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
          <LayoutDashboard size={20} className={pathname.includes('/dashboard') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'} />
          <span className={`text-[10px] font-semibold tracking-wide ${pathname.includes('/dashboard') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'}`}>Dashboard</span>
        </Link>
        
        <Link onClick={() => triggerHaptic('light')} href="/history" className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
          <Clock size={20} className={pathname.includes('/history') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'} />
          <span className={`text-[10px] font-semibold tracking-wide ${pathname.includes('/history') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'}`}>History</span>
        </Link>

        {/* Floating Action Button for Scan */}
        <Link onClick={() => triggerHaptic('light')} href="/upload" className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform relative">
          <div className="absolute -top-6 bg-[#1E3A8A] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-[var(--color-background)]">
            <ScanLine size={24} />
          </div>
          <span className="text-[10px] font-semibold tracking-wide text-[#1E3A8A] mt-8">Scan</span>
        </Link>
        
        
          <Link onClick={() => triggerHaptic('light')} href="/rules" className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
            <ShieldAlert size={20} className={pathname.includes('/rules') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'} />
            <span className={`text-[10px] font-semibold tracking-wide ${pathname.includes('/rules') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'}`}>Rules</span>
          </Link>
        
        <Link onClick={() => triggerHaptic('light')} href="/settings" className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform">
          <Settings size={20} className={pathname.includes('/settings') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'} />
          <span className={`text-[10px] font-semibold tracking-wide ${pathname.includes('/settings') ? 'text-[#1E3A8A]' : 'text-[var(--color-text-muted)]'}`}>Settings</span>
        </Link>
        
      </div>
    </div>
  );
}
