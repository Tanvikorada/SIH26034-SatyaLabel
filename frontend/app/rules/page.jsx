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
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        const d = json.data || json;
        setRules(Array.isArray(d) ? d : (d.rules || []));
      } catch {
        setRules([{ rule_id: 'C01', name: 'Product Name', description: 'Must have product name', severity: 'high', active: true }]);
      } finally { setLoading(false); }
    };
    fetchRules();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-midnight text-white"><NavBar/><div className="p-10 text-mist text-[14px]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-midnight text-white">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Rules Config</h1>
        <p className="text-[15px] text-mist mb-10">Manage Legal Metrology Act constraints.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r, i) => (
            <div key={i} className="mello-card-flat p-6 flex flex-col group hover:border-mist transition-colors">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${r.active ? 'bg-[#4ade80]' : 'bg-fog'}`}></div>
                  <span className="font-mono text-[13px] text-mist">{r.rule_id}</span>
                </div>
                <span className={r.active ? 'mello-badge-pass' : 'mello-badge-na'}>{r.active ? 'Active' : 'Inactive'}</span>
              </div>
              <h3 className="font-medium text-[16px] text-white mb-2">{r.name}</h3>
              <p className="text-[14px] text-fog leading-relaxed mb-6 flex-1">{r.description}</p>
              
              <div className="pt-4 border-t border-graphite flex justify-between items-center">
                <span className={`text-[12px] font-medium uppercase tracking-wider ${r.severity === 'high' ? 'text-[#f87171]' : 'text-mist'}`}>{r.severity} severity</span>
                <button className="mello-btn-secondary !py-1 !px-3 !text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
