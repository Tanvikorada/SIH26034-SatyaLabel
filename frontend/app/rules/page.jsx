"use client";

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export default function RulesPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const activeRules = [
    {
      id: 'R03',
      name: 'Mandatory Declarations',
      desc: 'Name, Address of Mfr/Packer/Importer, Net Quantity, MRP, Month/Year of Manufacture.',
      severity: 'High',
      status: 'Active (P1 MVP)'
    },
    {
      id: 'R26',
      name: 'Exemption for Small/Large Packages',
      desc: 'Net weight <= 10g/10ml or > 25kg/25L are exempt from certain primary declarations.',
      severity: 'Medium',
      status: 'Active (P1 MVP)'
    },
    {
      id: 'R31',
      name: 'E-commerce Declarations',
      desc: 'E-commerce listings must display Name, Address, Net Qty, MRP, and Country of Origin.',
      severity: 'High',
      status: 'Active (P1 MVP)'
    }
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Active Rule Configuration</h1>
          <p className="text-gray-500">Legal Metrology (Packaged Commodities) Rules, 2011</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search rules..." 
            className="pl-9 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0f172a] text-sm w-full sm:w-64"
          />
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeRules.map(r => (
              <tr key={r.id}>
                <td className="font-mono font-semibold">{r.id}</td>
                <td>
                  <div className="font-medium text-[#0f172a]">{r.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{r.desc}</div>
                </td>
                <td>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${r.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.severity}
                  </span>
                </td>
                <td>
                  <span className="text-[#059669] font-medium text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
