"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileSearch } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we fetch from API. 
    // For MVP, we load mock history to show table layout
    setTimeout(() => {
      setHistory([
        { id: 'SCN-84920', product: 'Britannia Good Day', date: '2026-08-25', status: 'PASS' },
        { id: 'SCN-84919', product: 'Maggi Noodles 70g', date: '2026-08-25', status: 'POTENTIAL NON-COMPLIANCE' },
        { id: 'SCN-84918', product: 'Amul Taaza 1L', date: '2026-08-24', status: 'MANUAL REVIEW' },
        { id: 'SCN-84917', product: 'Generic Rice 5kg', date: '2026-08-24', status: 'PASS' },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'PASS') return 'text-emerald-700 bg-emerald-100';
    if (status === 'POTENTIAL NON-COMPLIANCE') return 'text-red-700 bg-red-100';
    if (status === 'MANUAL REVIEW') return 'text-amber-700 bg-amber-100';
    return 'text-gray-700 bg-gray-100';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Inspection History</h1>
          <p className="text-gray-500">Repository of all scanned packaging labels</p>
        </div>
        <button onClick={() => router.push('/upload')} className="gov-btn flex items-center gap-2">
          <FileSearch className="w-4 h-4" />
          New Scan
        </button>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Scan ID</th>
              <th>Product Name</th>
              <th>Date</th>
              <th>Compliance Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item.id}>
                <td className="font-mono font-medium">{item.id}</td>
                <td className="font-medium text-[#0f172a]">{item.product}</td>
                <td>{item.date}</td>
                <td>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => router.push(`/results/${item.id}`)}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View Report
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan="5" className="text-center text-gray-500 py-8">No scans found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
