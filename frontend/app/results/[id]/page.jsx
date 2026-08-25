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
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#000000' });
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
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        setReport(json.data || json);
      } catch {
        setReport({
          id: resolvedParams.id, status: 'completed', overallStatus: 'POTENTIAL NON-COMPLIANCE',
          compliance_score: 42, product: { product_name: 'Mock Product', brand_name: 'Mock Brand' },
          extractedFields: { net_quantity: '100g', mrp: '50' }, ocr_raw_text: "NET WT 100g MRP 50",
          violations: [
            { rule_id: 'C02', detail_text: 'MRP not in standard format.', severity: 'high', status: 'POTENTIAL NON-COMPLIANCE' },
            { rule_id: 'C05', detail_text: 'Veg logo missing.', severity: 'low', status: 'MANUAL REVIEW' }
          ]
        });
      } finally { setLoading(false); }
    };
    fetchScan();
  }, [resolvedParams.id, router, API]);

  if (loading) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-text-secondary text-[14px]">Loading report...</div></div>;
  if (!report) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-red-500">Not found</div></div>;

  const getBadge = (s) => {
    if (s === 'PASS') return 'mello-badge-pass';
    if (s === 'MANUAL REVIEW') return 'mello-badge-review';
    if (s === 'POTENTIAL NON-COMPLIANCE') return 'mello-badge-fail';
    return 'mello-badge-na';
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <div className="max-w-[1000px] mx-auto px-6 py-12" ref={reportRef}>
        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={getBadge(report.overallStatus || report.overall_compliance)}>{report.overallStatus || report.overall_compliance}</div>
              <span className="text-[13px] text-text-muted font-mono">ID: {report.id}</span>
            </div>
            <h1 className="text-[40px] font-medium tracking-tight leading-[1.1] mb-2">{report.product?.product_name || 'Unknown Product'}</h1>
            <p className="text-[16px] text-text-secondary">{report.product?.brand_name || 'No Brand'}</p>
          </div>
          <div className="text-right mello-card-flat px-6 py-4 flex flex-col items-center">
             <div className="text-[13px] text-text-muted mb-1">Compliance Score</div>
             <div className="text-[40px] font-medium tracking-tight">{report.compliance_score || 0}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="text-[18px] font-medium tracking-tight mb-2">Rule Checks</h3>
            {(report.violations || []).map((v, i) => (
              <div key={i} className="mello-card-flat hover:bg-surface/80 transition-colors cursor-pointer" onClick={() => setExpandedRule(expandedRule === i ? null : i)}>
                <div className="flex justify-between items-center p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-[6px] h-[6px] rounded-full bg-mist"></div>
                    <span className="font-medium text-[15px]">{v.rule_id}</span>
                  </div>
                  <div className={getBadge(v.status)}>{v.status}</div>
                </div>
                {expandedRule === i && (
                  <div className="px-5 pb-5 pt-2 border-t border-border text-[14px] text-text-primary leading-relaxed bg-surface/30 rounded-b-[24px]">
                    {v.detail || v.detail_text}
                  </div>
                )}
              </div>
            ))}
            
            <div className="mello-card p-6 mt-6">
              <h3 className="text-[15px] font-medium mb-4">Raw Extraction Log</h3>
              <div className="bg-background border border-border p-4 rounded-[12px] font-mono text-[12px] text-text-muted whitespace-pre-wrap">
                {report.ocr_raw_text || 'No raw text available.'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <h3 className="text-[18px] font-medium tracking-tight mb-2">Extracted Data</h3>
             <div className="mello-card p-6">
               <div className="flex flex-col">
                 {Object.entries(report.extractedFields || report.extracted_fields || {}).map(([k,v]) => (
                   <div key={k} className="py-3 flex flex-col gap-1 border-b border-border last:border-0">
                     <span className="text-[12px] text-text-muted uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
                     <span className="text-[14px] font-medium text-text-primary truncate">{String(v)}</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <button onClick={downloadPDF} className="mello-btn-secondary w-full mt-2">Download PDF Notice</button>
             {localStorage.getItem('role') === 'admin' && (
                <button className="mello-btn-secondary w-full text-[#f87171] border-[#521c1c] hover:bg-[#260e0e]">Delete Record</button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
