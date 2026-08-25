'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload',    label: 'New Scan' },
  { href: '/history',   label: 'Repository' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]       = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('satyalabel_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('satyalabel_token');
    localStorage.removeItem('satyalabel_user');
    setUser(null);
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <>
      <nav
        style={{
          background: scrolled
            ? 'hsla(226,25%,7%,0.92)'
            : 'hsl(226,25%,7%)',
          borderBottom: `1px solid ${scrolled ? 'hsla(226,18%,22%,0.9)' : 'hsl(226,18%,15%)'}`,
          backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.2)' : 'none',
          transition: 'all 0.2s ease',
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-5 h-[54px] flex items-center justify-between">

          {/* ── Brand ─────────────────────────────────────────── */}
          <Link href="/dashboard" className="flex items-center gap-3 group select-none">
            <div
              className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(27,95%,58%), hsl(20,92%,50%))',
                boxShadow: '0 2px 8px hsla(27,95%,58%,0.35)',
              }}
            >
              {/* Shield checkmark */}
              <svg className="w-[15px] h-[15px]" viewBox="0 0 20 20" fill="hsl(226,28%,8%)">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-[15px] font-bold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(120deg, hsl(27,95%,65%), hsl(27,95%,55%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                SatyaLabel
              </span>
              <span className="text-[10px] hidden sm:block" style={{ color: 'var(--text-faint)', letterSpacing: '0.03em' }}>
                Legal Metrology · SIH26034
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-3.5 py-1.5 text-[13.5px] font-medium rounded-md transition-all duration-150"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: active ? 'var(--bg-raised)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-muted)'; e.currentTarget.style.background = active ? 'var(--bg-raised)' : 'transparent'; }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-[-2px] left-3 right-3 h-[2px] rounded-full"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right side ────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Scan CTA */}
            <Link
              href="/upload"
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-[7px] rounded-[7px] transition-all duration-150"
              style={{
                background: 'var(--accent)',
                color: 'hsl(226,28%,6%)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 3px 10px var(--accent-glow)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = ''; }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Scan Label
            </Link>

            {/* Separator */}
            <div className="hidden sm:block w-px h-5" style={{ background: 'var(--border)' }} />

            {/* User pill */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                  <span className="text-[10px] capitalize mt-0.5" style={{ color: 'var(--text-faint)' }}>{user.role}</span>
                </div>
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: 'var(--bg-raised)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                >
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150"
                  style={{ background: 'transparent', color: 'var(--text-faint)', border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[13px] font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md transition-colors ml-1"
              style={{ color: 'var(--text-secondary)', background: mobileOpen ? 'var(--bg-raised)' : 'transparent' }}
              onClick={() => setMobileOpen(o => !o)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 py-3 space-y-1 animate-fade-in"
            style={{ borderColor: 'var(--border-muted)', background: 'var(--bg-surface)' }}
          >
            {LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--bg-raised)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    paddingLeft: active ? '10px' : '12px',
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <div className="pt-1">
              <Link
                href="/upload"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--accent)', color: 'hsl(226,28%,6%)' }}
              >
                📷 Scan Label
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* India stripe */}
      <div className="india-stripe" />
    </>
  );
}
