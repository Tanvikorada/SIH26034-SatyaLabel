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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/scans`);
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

        <div className="mello-card overflow-hidden">
          <div className="flex w-full px-6 py-4 text-[12px] font-medium text-text-muted border-b border-border bg-surface">
            <div className="w-2/5">PRODUCT</div>
            <div className="w-1/4">DATE</div>
            <div className="w-1/4">STATUS</div>
            <div className="w-1/12 text-right"></div>
          </div>
          <div className="flex flex-col">
            {scans.map((s, i) => (
              <div key={i} className="flex w-full px-6 py-5 items-center border-b border-border last:border-0 hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => router.push(`/results/${s.id}`)}>
                <div className="w-2/5 font-medium text-[14px] text-text-primary">{s.product?.product_name || s.id}</div>
                <div className="w-1/4 text-[14px] text-text-secondary">{new Date(s.createdAt || s.created_at).toLocaleDateString()}</div>
                <div className="w-1/4">
                  <span className={s.overall_compliance === 'PASS' ? 'mello-badge-pass' : 'mello-badge-fail'}>{s.overall_compliance}</span>
                </div>
                <div className="w-1/12 text-right text-text-muted hover:text-text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
