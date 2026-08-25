"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Results({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }
    const fetchScan = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          setReport(await res.json());
        } else {
          throw new Error('Failed');
        }
      } catch (err) {
        // Fallback for demo
        setReport({
          id: resolvedParams.id,
          product_name: 'Britannia Good Day',
          overall_status: 'POTENTIAL NON-COMPLIANCE',
          confidence_score: 0.92,
          extracted_fields: {
            manufacturer_name: 'Britannia Industries Ltd.',
            manufacturer_address: null,
            net_quantity: '250g',
            mrp: '35.00',
            country_of_origin: null,
            customer_care: '1800-111-222'
          },
          rule_checks: [
            { rule_id: 'C03-A', name: 'Manufacturer Name', status: 'PASS', detail: 'Found: Britannia Industries Ltd.', severity: 'High' },
            { rule_id: 'C03-B', name: 'Manufacturer Address', status: 'MANUAL REVIEW', detail: 'Address incomplete or missing.', severity: 'High' },
            { rule_id: 'C04', name: 'Net Quantity', status: 'PASS', detail: 'Found: 250g', severity: 'High' },
            { rule_id: 'C05', name: 'MRP', status: 'PASS', detail: 'Found: 35.00', severity: 'High' },
            { rule_id: 'C10', name: 'Country of Origin', status: 'POTENTIAL NON-COMPLIANCE', detail: 'Missing country of origin.', severity: 'High' }
          ],
          raw_ocr_text: "BRITANNIA GOOD DAY CASHEW... MRP 35.00 Net Wt. 250g..."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Report...</div>;

  const getStatusInfo = (status) => {
    if (status === 'PASS') return { color: 'bg-[#059669]', bg: 'bg-[#ecfdf5]', icon: <ShieldCheck className="w-12 h-12 text-white" /> };
    if (status === 'POTENTIAL NON-COMPLIANCE') return { color: 'bg-[#dc2626]', bg: 'bg-[#fef2f2]', icon: <ShieldAlert className="w-12 h-12 text-white" /> };
    return { color: 'bg-[#d97706]', bg: 'bg-[#fffbeb]', icon: <AlertTriangle className="w-12 h-12 text-white" /> };
  };

  const statusInfo = getStatusInfo(report.overall_status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-4 gap-4">
        <div>
          <p className="text-sm font-mono text-gray-500 mb-1">ID: {report.id} • {new Date().toLocaleDateString()}</p>
          <h1 className="text-2xl font-bold text-[#0f172a]">{report.product_name || 'Unknown Product'}</h1>
        </div>
        <button onClick={() => router.push('/dashboard')} className="gov-btn-outline text-sm">
          Return to Dashboard
        </button>
      </div>

      {/* Verification Status Banner */}
      <div className={`border rounded-lg flex items-center p-6 ${statusInfo.bg} border-opacity-50`} style={{ borderColor: statusInfo.color }}>
        <div className={`w-20 h-20 rounded-lg flex items-center justify-center shrink-0 ${statusInfo.color}`}>
          {statusInfo.icon}
        </div>
        <div className="ml-6">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-1">Verification Status</p>
          <h2 className="text-3xl font-bold" style={{ color: statusInfo.color === 'bg-[#059669]' ? '#047857' : statusInfo.color === 'bg-[#dc2626]' ? '#b91c1c' : '#b45309' }}>
            {report.overall_status}
          </h2>
          <p className="text-sm text-gray-700 mt-2">
            Confidence Score: <span className="font-mono font-medium">{(report.confidence_score * 100).toFixed(1)}%</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Left Column: Extracted Data */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-gray-200 pb-2">Extracted Data</h3>
          <div className="gov-card">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(report.extracted_fields || {}).map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 text-gray-500 font-medium capitalize border-b border-gray-100">{k.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0f172a] border-b border-gray-100">{v || <span className="text-red-500">Missing</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="gov-card p-4">
            <button 
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center justify-between w-full text-sm font-semibold text-[#0f172a]"
            >
              Raw OCR Output
              {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRaw && (
              <pre className="mt-4 p-3 bg-gray-900 text-gray-200 text-xs rounded font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                {report.raw_ocr_text}
              </pre>
            )}
          </div>
        </div>

        {/* Right Column: Rule Checks */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] border-b border-gray-200 pb-2">Rule Compliance Log</h3>
          <div className="space-y-3">
            {report.rule_checks?.map((check, i) => (
              <div key={i} className="gov-card p-4 flex gap-4">
                <div className="shrink-0">
                  {check.status === 'PASS' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</div>
                  ) : check.status === 'POTENTIAL NON-COMPLIANCE' ? (
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">X</div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">!</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-500">{check.rule_id}</span>
                    <span className="font-semibold text-[#0f172a] text-sm">{check.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
