"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import SplitText from '@/components/SplitText';

export default function History() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch(`${API}/scans`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          const scanList = d.scans || d.rows || [];
          setScans(scanList.map(s => ({
            id: s.id,
            name: s.product_name || s.brand_name || 'Verification Scan',
            date: new Date(s.created_at).toLocaleDateString('en-GB'),
            status: s.overall_compliance || s.overallStatus || 'NOT VERIFIED'
          })));
        } else {
          throw new Error('Failed');
        }
      } catch (err) {
        setScans([
          { id: 'SCN-84920', name: 'Britannia Good Day', date: '25/08/2026', status: 'PASS' },
          { id: 'SCN-84919', name: 'Generic Milk 1L', date: '25/08/2026', status: 'POTENTIAL NON-COMPLIANCE' },
          { id: 'SCN-84918', name: 'Maggi Noodles', date: '25/08/2026', status: 'MANUAL REVIEW' },
          { id: 'SCN-84917', name: 'Amul Butter 100g', date: '24/08/2026', status: 'PASS' },
          { id: 'SCN-84916', name: 'Sony Headphones', date: '24/08/2026', status: 'NOT APPLICABLE' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const filters = ['ALL', 'PASS', 'POTENTIAL NON-COMPLIANCE', 'MANUAL REVIEW', 'NOT APPLICABLE'];

  const filteredScans = filter === 'ALL' ? scans : scans.filter(s => s.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div>
        <SplitText
          text="Repository"
          className="text-3xl md:text-4xl font-black text-navy-900 tracking-tight"
          delay={20}
          duration={0.8}
          tag="h1"
        />
        <p className="text-text-secondary text-sm md:text-base mt-2">Search and filter past inspections from the secure ledger</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by Scan ID or Product Name..."
          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
              filter === f 
                ? 'bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-900/20' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-navy-900 hover:text-navy-900 shadow-sm'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p className="font-mono text-sm uppercase tracking-widest">Loading Ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500">Scan ID</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500">Product</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredScans.map(s => (
                  <tr key={s.id} onClick={() => router.push(`/results/${s.id}`)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                    <td className="p-5 font-mono text-sm font-bold text-gray-500 group-hover:text-navy-900">{s.id.slice(0,18)}...</td>
                    <td className="p-5 font-bold text-gray-900">{s.name}</td>
                    <td className="p-5 text-gray-500 font-mono text-sm">{s.date}</td>
                    <td className="p-5">
                      <div className="stamp-badge border-[1px] p-1.5 shadow-sm" style={{ 
                        borderColor: s.status === 'PASS' ? 'var(--color-pass)' : s.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant)' : s.status === 'MANUAL REVIEW' ? 'var(--color-review)' : 'var(--color-na)',
                        backgroundColor: s.status === 'PASS' ? 'var(--color-pass-bg)' : s.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant-bg)' : s.status === 'MANUAL REVIEW' ? 'var(--color-review-bg)' : 'var(--color-na-bg)',
                      }}>
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider" style={{
                            color: s.status === 'PASS' ? 'var(--color-pass)' : s.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant)' : s.status === 'MANUAL REVIEW' ? 'var(--color-review)' : 'var(--color-na)',
                        }}>{s.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredScans.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400 font-mono text-sm uppercase tracking-widest">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
