"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    const fetchScans = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/scans`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        const d = json.data || json;
        setScans(Array.isArray(d) ? d : (d.scans || []));
      } catch {
        setScans([{ id: 'mock1', product: { product_name: 'Mock Product' }, status: 'PASS', overall_compliance: 'PASS', createdAt: new Date().toISOString() }]);
      } finally { setLoading(false); }
    };
    fetchScans();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-text-secondary text-[14px]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Scan Repository</h1>
        <p className="text-[15px] text-text-secondary mb-10">Historical record of all compliance checks.</p>

        
        <div className="flex flex-col gap-4 md:mello-card md:gap-0 md:overflow-hidden md:p-0">
          <div className="hidden md:flex w-full px-6 py-4 text-[12px] font-medium text-text-muted border-b border-border bg-surface">
            <div className="w-2/5">PRODUCT</div>
            <div className="w-1/4">DATE</div>
            <div className="w-1/4">STATUS</div>
            <div className="w-1/12 text-right"></div>
          </div>
          <div className="flex flex-col gap-4 md:gap-0">
            {scans.map((s, i) => (
              <div key={i} className="flex flex-col md:flex-row w-full p-5 md:px-6 md:py-5 items-start md:items-center bg-background md:bg-transparent border border-border md:border-b md:border-x-0 md:border-t-0 last:border-0 rounded-xl md:rounded-none hover:border-[var(--color-primary)] md:hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => router.push(/results/)}>
                
                {/* Mobile: Header with status */}
                <div className="flex md:hidden items-center justify-between w-full mb-3">
                  <div className="text-[12px] text-text-secondary">{new Date(s.createdAt || s.created_at).toLocaleDateString()}</div>
                  <span className={s.overall_compliance === 'PASS' || s.overall_compliance === 'pass' ? 'mello-badge-pass' : (s.overall_compliance === 'processing' ? 'mello-badge-na' : 'mello-badge-fail')}>{s.status === 'failed' ? 'FAILED' : (s.overall_compliance || s.status)}</span>
                </div>

                {/* Desktop Product / Mobile Title */}
                <div className="w-full md:w-2/5 font-medium text-[15px] md:text-[14px] text-text-primary mb-1 md:mb-0 truncate">{s.product?.product_name || s.id}</div>
                
                {/* Desktop Date */}
                <div className="hidden md:block w-1/4 text-[14px] text-text-secondary">{new Date(s.createdAt || s.created_at).toLocaleDateString()}</div>
                
                {/* Desktop Status */}
                <div className="hidden md:flex w-1/4">
                  <span className={s.overall_compliance === 'PASS' || s.overall_compliance === 'pass' ? 'mello-badge-pass' : (s.overall_compliance === 'processing' ? 'mello-badge-na' : 'mello-badge-fail')}>{s.status === 'failed' ? 'FAILED' : (s.overall_compliance || s.status)}</span>
                </div>
                
                {/* Mobile View details CTA */}
                <div className="flex md:hidden items-center text-[13px] text-[var(--color-primary)] font-medium mt-3 gap-1">
                  View full report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>

                {/* Desktop Arrow */}
                <div className="hidden md:block w-1/12 text-right text-text-muted hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
