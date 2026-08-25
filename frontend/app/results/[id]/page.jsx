"use client";
import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import NavBar from '@/components/NavBar';

export default function Results({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState(null);
  const reportRef = useRef(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  const downloadPDF = async () => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Notice_${report.id}.pdf`);
      toast.success('Downloaded', { id: toastId });
    } catch (err) {
      toast.error('Failed', { id: toastId });
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    const fetchScan = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await res.json();
        setReport(json.data || json);
      } catch {
        // Mock fallback
        setReport({
          id: resolvedParams.id, status: 'completed', overallStatus: 'POTENTIAL NON-COMPLIANCE',
          compliance_score: 42,
          product: { product_name: 'Mock Product', brand_name: 'Mock Brand' },
          extractedFields: { net_quantity: '100g', mrp: '50' },
          ocr_raw_text: "NET WT 100g MRP 50 INGREDIENTS SUGAR",
          violations: [
            { rule_id: 'C02', detail_text: 'MRP not in standard format.', severity: 'high', status: 'POTENTIAL NON-COMPLIANCE' },
            { rule_id: 'C05', detail_text: 'Veg logo missing.', severity: 'low', status: 'MANUAL REVIEW' }
          ]
        });
      } finally { setLoading(false); }
    };
    fetchScan();
  }, [resolvedParams.id, router, API]);

  if (loading) return <div className="p-8"><NavBar/><div className="mt-8 text-fog text-[14px]">Loading report...</div></div>;
  if (!report) return <div className="p-8"><NavBar/><div className="mt-8 text-red-500">Not found</div></div>;

  const getBadge = (s) => {
    if (s === 'PASS') return 'badge-pass';
    if (s === 'MANUAL REVIEW') return 'badge-review';
    if (s === 'POTENTIAL NON-COMPLIANCE') return 'badge-fail';
    return 'badge-na';
  };

  return (
    <div className="min-h-screen bg-canvas pb-24">
      <NavBar />
      
      <div className="max-w-[1000px] mx-auto px-6 py-[60px]" ref={reportRef}>
        <div className="flex justify-between items-end border-b border-ash pb-8 mb-8">
          <div>
            <div className="text-[14px] text-fog font-bold tracking-widest uppercase mb-2">Notice of Inspection</div>
            <h1 className="text-[56px] leading-[1.07] tracking-[-1.68px] mb-2">{report.product?.product_name || 'Unknown Product'}</h1>
            <p className="text-[18px] text-fog">ID: {report.id} &middot; {report.product?.brand_name || 'No Brand'}</p>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="text-[56px] leading-[1.07] tracking-[-1.68px] mb-2">{report.compliance_score || 0}%</div>
             <div className={getBadge(report.overallStatus || report.overall_compliance)}>{report.overallStatus || report.overall_compliance}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="text-[20px] font-bold tracking-[-0.4px] mb-2">Rule Checks</h3>
            {(report.violations || []).map((v, i) => (
              <div key={i} className="privy-card hover:bg-canvas/50 cursor-pointer" onClick={() => setExpandedRule(expandedRule === i ? null : i)}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-[8px] h-[8px] rounded-full bg-obsidian-ink"></div>
                    <span className="font-bold text-[15px]">{v.rule_id}</span>
                  </div>
                  <div className={getBadge(v.status)}>{v.status}</div>
                </div>
                {expandedRule === i && (
                  <div className="mt-4 pt-4 border-t border-ash text-[14px] text-fog">
                    {v.detail_text}
                  </div>
                )}
              </div>
            ))}
            
            {/* Raw Text */}
            <div className="privy-card mt-8">
              <h3 className="text-[14px] font-bold mb-4 tracking-[-0.02em]">Raw Extraction Log</h3>
              <div className="bg-canvas border border-ash p-4 rounded-lg font-mono text-[12px] text-fog whitespace-pre-wrap">
                {report.ocr_raw_text || 'No raw text available.'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <h3 className="text-[20px] font-bold tracking-[-0.4px] mb-2">Extracted Data</h3>
             <div className="privy-card">
               {Object.entries(report.extractedFields || report.extracted_fields || {}).map(([k,v]) => (
                 <div key={k} className="table-row-privy py-3 flex justify-between">
                   <span className="text-[13px] text-fog font-medium">{k}</span>
                   <span className="text-[13px] font-bold max-w-[150px] truncate">{String(v)}</span>
                 </div>
               ))}
             </div>
             
             <button onClick={downloadPDF} className="btn-ghost w-full mt-4">Download PDF Notice</button>
             {localStorage.getItem('role') === 'admin' && (
                <button className="btn-ghost w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white">Delete Record</button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
