"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') return router.push('/dashboard');
    const fetchRules = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/rules`);
        const json = await res.json();
        setRules(json.data || json || []);
      } catch {
        setRules([{ rule_id: 'C01', name: 'Product Name', description: 'Must have product name', severity: 'high', active: true }]);
      } finally { setLoading(false); }
    };
    fetchRules();
  }, [router]);

  if (loading) return <div className="p-8"><NavBar/><div className="mt-8 text-fog text-[14px]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-canvas">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-[80px]">
        <h1 className="text-[56px] leading-[1.07] tracking-[-1.68px] mb-2">Rules Config</h1>
        <p className="text-[18px] text-fog mb-12">Manage Legal Metrology Act constraints.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {rules.map((r, i) => (
            <div key={i} className="privy-card flex flex-col gap-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-[16px] tracking-[-0.02em]">{r.rule_id}</span>
                <span className={r.active ? 'badge-pass' : 'badge-na'}>{r.active ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 className="font-bold text-[14px] text-obsidian-ink">{r.name}</h3>
              <p className="text-[13px] text-fog">{r.description}</p>
              <div className="mt-4 pt-4 border-t border-ash flex justify-between items-center">
                <span className="text-[12px] font-bold uppercase tracking-widest text-fog">{r.severity} severity</span>
                <button className="btn-pill !border-obsidian-ink !text-obsidian-ink">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
