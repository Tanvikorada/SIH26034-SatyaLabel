
'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../../components/NavBar';
import { toast } from 'sonner';

export default function ResultsPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setReport(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success('Scan record deleted.');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete scan.');
      }
    } catch (err) {
      toast.error('Error deleting scan.');
    }
  };

  const downloadPDF = async () => {
    toast.info('Generating Official Government Report...');
    try {
      const res = await fetch(`${API}/scans/${resolvedParams.id}/report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to generate report');
      const json = await res.json();
      
      const fileUrl = json.data.file_url;
      const dlRes = await fetch(`${API.replace('/api/v1', '')}${fileUrl}?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const blob = await dlRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Legal_Metrology_Notice_${resolvedParams.id}.pdf`;
      a.click();
      toast.success('PDF Downloaded Successfully');
    } catch (e) {
      toast.error('Could not generate PDF');
    }
  };

  const downloadCSV = () => {
    const fields = report.extractedFields || report.extracted_fields || {};
    const violations = report.violations || [];
    const csvRows = [];
    csvRows.push("LEGAL METROLOGY COMPLIANCE REPORT");
    csvRows.push(`Scan ID,${report.id}`);
    csvRows.push(`Date,${new Date(report.created_at).toLocaleString()}`);
    csvRows.push(`Overall Status,${report.overall_compliance || report.overallStatus}`);
    csvRows.push(`Compliance Score,${report.compliance_score || report.complianceScore}%`);
    csvRows.push("");
    
    csvRows.push("--- EXTRACTED DATA ---");
    csvRows.push("Field Name,Extracted Value");
    for (const [k, v] of Object.entries(fields)) {
      if (!k.startsWith('_') && v) {
        const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        csvRows.push(`"${label}","${String(v).replace(/"/g, '""')}"`);
      }
    }
    
    csvRows.push("");
    csvRows.push("--- RULE VIOLATIONS ---");
    csvRows.push("Rule ID,Status,Severity,Details");
    for (const v of violations) {
      if(v.status !== 'PASS' && v.status !== 'NOT APPLICABLE') {
        csvRows.push(`"${v.rule_id}","${v.status}","${v.severity || 'high'}","${String(v.detail_text || v.detail || '').replace(/"/g, '""')}"`);
      }
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${report.id}.csv`;
    a.click();
  };

  if (loading) return <div className="min-h-screen bg-background text-text-primary flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>;
  if (!report) return <div className="min-h-screen bg-background text-text-primary p-12 text-center">Scan not found</div>;

  const isPass = (report.overallStatus || report.overall_compliance) === 'compliant';
  const badgeClass = isPass ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20';
  const scoreColor = report.compliance_score >= 80 ? 'text-green-500' : report.compliance_score >= 50 ? 'text-amber-500' : 'text-red-500';

  const fields = report.extractedFields || report.extracted_fields || {};

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <NavBar />
      
      <main className="max-w-[1000px] mx-auto px-6 mt-8">
        {/* HERO SECTION */}
        <div className="glass rounded-[24px] p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] font-mono text-text-muted tracking-wider">ID: {report.id}</span>
                <span className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                  {report.overallStatus || report.overall_compliance}
                </span>
              </div>
              <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight mb-1 text-text-primary">
                {report.product?.product_name || fields.product_name || 'Unknown Product'}
              </h1>
              <p className="text-text-secondary text-[16px]">
                {report.product?.brand_name || fields.brand_name || 'Brand Unspecified'}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="text-[12px] text-text-muted font-bold tracking-widest uppercase mb-1">AI Compliance Score</div>
              <div className={`text-[48px] font-medium tracking-tighter leading-none ${scoreColor}`}>
                {report.compliance_score || report.complianceScore}%
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">
            <button onClick={downloadPDF} className="mello-btn-primary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Notice
            </button>
            <button onClick={downloadCSV} className="mello-btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex space-x-1 border-b border-border mb-8">
          {['summary', 'evidence', 'data'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-[13px] font-bold tracking-widest uppercase transition-all ${activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-text-muted hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* TAB 1: SUMMARY / VIOLATIONS */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-[18px] font-medium text-text-primary mb-6">Legal Metrology Violations</h3>
            {(report.violations || []).filter(v => v.status !== 'PASS').map((v, i) => (
              <div key={i} className="glass rounded-[16px] p-6 border-l-4 border-l-red-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 font-mono text-[11px] font-bold rounded">{v.rule_id}</span>
                    <h4 className="text-[16px] font-medium text-text-primary">{v.rule_title}</h4>
                  </div>
                </div>
                <p className="text-[14px] text-text-secondary leading-relaxed font-mono">
                  {v.detail || v.detail_text}
                </p>
              </div>
            ))}
            {(report.violations || []).filter(v => v.status !== 'PASS').length === 0 && (
              <div className="glass rounded-[16px] p-12 text-center text-text-secondary">
                No violations detected! The product is fully compliant.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-[18px] font-medium text-text-primary">Attached Photographic Evidence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                let images = [];
                try {
                  const imgStr = report.original_image || report.originalImage || report.image_url;
                  images = JSON.parse(imgStr);
                  if (!Array.isArray(images)) images = [imgStr];
                  images = images.filter(Boolean); // protect against nulls
                } catch (e) {
                  images = [report.original_image || report.originalImage || report.image_url].filter(Boolean);
                }
                if (images.length === 0) return <div className="text-[14px] text-text-muted">No evidence attached.</div>;
                return images.map((img, idx) => (
                  <div key={idx} className="glass rounded-[16px] p-2 overflow-hidden aspect-square flex items-center justify-center bg-black/40">
                    <img src={img.startsWith('http') ? img : API.replace('/api/v1', '') + '/' + img} alt="Evidence" className="max-w-full max-h-full object-contain rounded-[8px]" />
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: DATA EXTRACTED */}
        {activeTab === 'data' && (
          <div className="animate-fade-in">
             <h3 className="text-[18px] font-medium text-text-primary mb-6">AI Structured Extraction</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(fields).filter(([k, v]) => !k.startsWith('_') && v).map(([k, v]) => (
                  <div key={k} className="glass rounded-[16px] p-5">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">
                      {k.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[14px] text-text-primary font-medium break-words leading-tight">
                      {String(v)}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
