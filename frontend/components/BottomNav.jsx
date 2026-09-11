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

  if (!mounted || pathname === '/login' || pathname === '/' || pathname.startsWith('/report') || pathname.startsWith('/verify')) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scan', path: '/upload', icon: ScanLine },
    { name: 'History', path: '/history', icon: Clock },
    ...(role === 'admin' ? [{ name: 'Rules', path: '/rules', icon: ShieldAlert }] : []),
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[0_-2px_16px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 h-[60px]">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link 
              key={item.name}
              onClick={() => triggerHaptic('light')} 
              href={item.path} 
              className="flex flex-col items-center justify-center flex-1 h-full gap-[3px] active:scale-95 transition-all duration-200"
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} 
              />
              <span className={`text-[10px] tracking-wide transition-colors ${isActive ? 'font-bold text-[var(--color-primary)]' : 'font-medium text-[var(--color-text-muted)]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
