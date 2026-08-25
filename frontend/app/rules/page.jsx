"use client";

import { useEffect, useState } from 'react';
import { Search, Loader2, BookOpen } from 'lucide-react';
import SplitText from '@/components/SplitText';

export default function RulesPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch(`${API}/rules`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          setRules((d || []).map(r => ({
            id: r.rule_id,
            name: r.rule_title,
            desc: r.description,
            severity: (r.severity || 'Medium').charAt(0).toUpperCase() + (r.severity || 'Medium').slice(1),
            status: 'Active (v1.0)'
          })));
        } else {
          throw new Error('Failed');
        }
      } catch (err) {
        setRules([
          { id: 'Rule 6(1)(a)', name: 'Manufacturer / Packer / Importer Name and Address', desc: 'Every package shall bear the name and address of the manufacturer, packer, or importer. Address must include at minimum: city/district name OR a 6-digit PIN code.', severity: 'High', status: 'Active (P1 MVP)' },
          { id: 'Rule 6(1)(e)', name: 'Customer Care Details', desc: 'Must display customer care contact number AND email address for consumer complaints.', severity: 'Medium', status: 'Active (P1 MVP)' },
          { id: 'Rule 26', name: 'Exemption for Small/Large Packages', desc: 'Net weight <= 10g/10ml or > 25kg/25L are exempt from certain primary declarations.', severity: 'Low', status: 'Active (P1 MVP)' },
          { id: 'Rule 31', name: 'E-commerce Declarations', desc: 'E-commerce listings must display Name, Address, Net Qty, MRP, and Country of Origin.', severity: 'High', status: 'Active (P1 MVP)' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const filteredRules = rules.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) || 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <SplitText
            text="Rule Configuration"
            className="text-3xl md:text-4xl font-black text-navy-900 tracking-tight"
            delay={20}
            duration={0.8}
            tag="h1"
          />
          <p className="text-text-secondary text-sm md:text-base mt-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" /> Legal Metrology (Packaged Commodities) Rules, 2011
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search gazette rules..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm bg-white text-sm w-full transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
            <p className="font-mono text-sm uppercase tracking-widest">Loading Configuration...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500 w-32">Rule ID</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500">Gazette Description</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500 w-24">Severity</th>
                  <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-500 w-32">Engine Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRules.map(r => (
                  <tr key={r.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-5 font-mono text-sm font-bold text-navy-900 bg-gray-50/50 group-hover:bg-transparent transition-colors">
                      {r.id}
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-gray-900 text-sm mb-1">{r.name}</div>
                      <div className="text-sm text-gray-500 leading-relaxed max-w-2xl">{r.desc}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${r.severity === 'High' ? 'bg-red-50 text-red-600 border-red-200' : r.severity === 'Low' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRules.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400 font-mono text-sm uppercase tracking-widest">
                      No matching rules found in gazette
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
