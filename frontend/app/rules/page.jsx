"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('violated');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') return router.push('/dashboard');
    const fetchRules = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';
        const res = await fetch(`${API}/rules`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const statsRes = await fetch(`${API}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          setRules(Array.isArray(d) ? d : (d.rules || []));
        }
        if (statsRes.ok) {
          const sjson = await statsRes.json();
          setStats(sjson.data || sjson);
        }
      } catch {
        setRules([{ rule_id: 'C01', name: 'Product Name', description: 'Must have product name', severity: 'high', active: true }]);
      } finally { setLoading(false); }
    };
    fetchRules();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-text-secondary text-[14px]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Rules Config</h1>
        <p className="text-[15px] text-text-secondary mb-10">Manage Legal Metrology Act constraints.</p>

        <div className="flex gap-4 border-b border-border mb-8">
          <button 
            onClick={() => setActiveTab('violated')}
            className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'violated' ? 'border-[#f87171] text-[#f87171]' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            System-Wide Violations
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'all' ? 'border-blue-500 text-blue-500' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            All 2011 Act Rules
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules
            .filter(r => {
              if (activeTab === 'all') return true;
              const isViolated = stats?.top_violated_rules?.some(tr => tr.rule_id === r.rule_id);
              // Fallback to high severity if no stats available yet
              return isViolated || r.severity === 'high';
            })
            .map((r, i) => {
              const violationStats = stats?.top_violated_rules?.find(tr => tr.rule_id === r.rule_id);
              
              return (
                <div key={i} className="mello-card-flat p-6 flex flex-col group hover:border-mist transition-colors relative overflow-hidden">
                  {activeTab === 'violated' && violationStats && (
                    <div className="absolute top-0 right-0 bg-[#f87171]/10 text-[#f87171] text-[11px] font-bold px-3 py-1 rounded-bl-lg">
                      Failed {violationStats.count} times
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${r.active ? 'bg-[#4ade80]' : 'bg-fog'}`}></div>
                      <span className="font-mono text-[13px] text-text-secondary">{r.rule_id}</span>
                    </div>
                    <span className={r.active ? 'mello-badge-pass' : 'mello-badge-na'}>{r.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <h3 className="font-medium text-[16px] text-text-primary mb-2">{r.name}</h3>
                  <p className="text-[14px] text-text-muted leading-relaxed mb-6 flex-1">{r.description}</p>
                  
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className={`text-[12px] font-medium uppercase tracking-wider ${r.severity === 'high' ? 'text-[#f87171]' : 'text-text-secondary'}`}>{r.severity} severity</span>
                    <button className="mello-btn-secondary !py-1 !px-3 !text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                  </div>
                </div>
              );
          })}
        </div>
      </div>
    </div>
  );
}
