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
        const json = await res.json();
        setScans(json.data || json || []);
      } catch {
        setScans([{ id: 'mock1', product: { product_name: 'Mock Product' }, status: 'PASS', overall_compliance: 'PASS', createdAt: new Date().toISOString() }]);
      } finally { setLoading(false); }
    };
    fetchScans();
  }, [router]);

  if (loading) return <div className="p-8"><NavBar/><div className="mt-8 text-fog text-[14px]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-[80px]">
        <h1 className="text-[56px] leading-[1.07] tracking-[-1.68px] mb-2">Scan Repository</h1>
        <p className="text-[18px] text-fog mb-12">Historical record of all compliance checks.</p>

        <div className="w-full border-t border-obsidian-ink/10">
          <div className="flex w-full py-4 text-[12px] font-bold text-fog uppercase tracking-widest border-b border-obsidian-ink/10">
            <div className="w-1/3">Product</div>
            <div className="w-1/4">Date</div>
            <div className="w-1/4">Status</div>
            <div className="w-1/6 text-right">Action</div>
          </div>
          {scans.map((s, i) => (
            <div key={i} className="flex w-full py-4 items-center border-b border-ash hover:bg-canvas/50 transition-colors">
              <div className="w-1/3 font-medium text-[14px]">{s.product?.product_name || s.id}</div>
              <div className="w-1/4 text-[14px] text-fog">{new Date(s.createdAt || s.created_at).toLocaleDateString()}</div>
              <div className="w-1/4">
                <span className={s.overall_compliance === 'PASS' ? 'badge-pass' : 'badge-fail'}>{s.overall_compliance}</span>
              </div>
              <div className="w-1/6 text-right">
                <button onClick={() => router.push(`/results/${s.id}`)} className="text-[13px] font-bold text-obsidian-ink hover:underline">View &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
