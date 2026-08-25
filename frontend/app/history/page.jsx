"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function History() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');

  const scans = [
    { id: 'SCN-84920', name: 'Britannia Good Day', date: '25 Aug 2026', status: 'PASS' },
    { id: 'SCN-84919', name: 'Generic Milk 1L', date: '25 Aug 2026', status: 'POTENTIAL NON-COMPLIANCE' },
    { id: 'SCN-84918', name: 'Maggi Noodles', date: '25 Aug 2026', status: 'MANUAL REVIEW' },
    { id: 'SCN-84917', name: 'Amul Butter 100g', date: '24 Aug 2026', status: 'PASS' },
    { id: 'SCN-84916', name: 'Sony Headphones', date: '24 Aug 2026', status: 'NOT APPLICABLE' },
  ];

  const filters = ['ALL', 'PASS', 'POTENTIAL NON-COMPLIANCE', 'MANUAL REVIEW', 'NOT APPLICABLE'];

  const filteredScans = filter === 'ALL' ? scans : scans.filter(s => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">Repository</h1>
        <p className="text-text-secondary text-sm md:text-base mt-1">Search and filter past inspections</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search by Scan ID or Product Name..."
          className="w-full pl-10 pr-4 py-3 border border-border rounded-sm bg-surface-alt text-sm focus:outline-none focus:border-navy-900"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border transition-colors ${
              filter === f 
                ? 'bg-navy-900 text-white border-navy-900' 
                : 'bg-surface-alt text-text-secondary border-border hover:border-navy-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Scan ID</th>
              <th>Product</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.map(s => (
              <tr key={s.id} onClick={() => router.push(`/results/${s.id}`)} className="cursor-pointer">
                <td className="font-mono">{s.id}</td>
                <td className="font-medium">{s.name}</td>
                <td className="text-text-muted font-mono">{s.date}</td>
                <td>
                  <div className="stamp-badge border-[1px] p-1" style={{ 
                    borderColor: s.status === 'PASS' ? 'var(--color-pass)' : s.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant)' : s.status === 'MANUAL REVIEW' ? 'var(--color-review)' : 'var(--color-na)',
                    backgroundColor: s.status === 'PASS' ? 'var(--color-pass-bg)' : s.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant-bg)' : s.status === 'MANUAL REVIEW' ? 'var(--color-review-bg)' : 'var(--color-na-bg)',
                  }}>
                    <span className="font-mono text-[10px] font-bold uppercase" style={{
                        color: s.status === 'PASS' ? 'var(--color-pass)' : s.status === 'POTENTIAL NON-COMPLIANCE' ? 'var(--color-noncompliant)' : s.status === 'MANUAL REVIEW' ? 'var(--color-review)' : 'var(--color-na)',
                    }}>{s.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
