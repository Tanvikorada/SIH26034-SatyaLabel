"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ScanLine, Clock, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || pathname === '/login' || pathname === '/') return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-[var(--color-border)] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 h-16">
        
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full gap-1 active-press">
          <LayoutDashboard size={22} className={pathname === '/dashboard' ? 'text-primary' : 'text-text-muted'} />
          <span className={`text-[10px] font-medium tracking-wide ${pathname === '/dashboard' ? 'text-primary' : 'text-text-muted'}`}>Dashboard</span>
        </Link>
        
        <Link href="/upload" className="flex flex-col items-center justify-center w-full h-full gap-1 active-press relative">
          <div className="absolute -top-6 bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background transition-transform active:scale-95">
            <ScanLine size={24} />
          </div>
          <span className="text-[10px] font-medium tracking-wide text-primary mt-8">Scan</span>
        </Link>
        
        <Link href="/history" className="flex flex-col items-center justify-center w-full h-full gap-1 active-press">
          <Clock size={22} className={pathname === '/history' ? 'text-primary' : 'text-text-muted'} />
          <span className={`text-[10px] font-medium tracking-wide ${pathname === '/history' ? 'text-primary' : 'text-text-muted'}`}>History</span>
        </Link>
        
      </div>
    </div>
  );
}
