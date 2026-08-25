"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, AlertTriangle, MinusCircle, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

export default function Results({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState(null);

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
        setReport({
          id: resolvedParams.id,
          product_name: 'Britannia Good Day',
          overall_status: 'POTENTIAL NON-COMPLIANCE',
          extracted_fields: {
            manufacturer_name: 'Britannia Industries Ltd.',
            manufacturer_address: null,
            net_quantity: '250g',
            mrp: '35.00',
            country_of_origin: null
          },
          rule_checks: [
            { rule_id: 'Rule 26', name: 'Country of Origin Missing', status: 'POTENTIAL NON-COMPLIANCE', detail: 'Missing country of origin declaration on imported or domestic product.', severity: 'High' },
            { rule_id: 'Rule 3', name: 'Manufacturer Address', status: 'MANUAL REVIEW', detail: 'Address found is incomplete. Manual verification required.', severity: 'High' },
            { rule_id: 'Rule 31', name: 'E-commerce Declarations', status: 'PASS', detail: 'Product is compliant with e-commerce listing requirements.', severity: 'High' }
          ],
          raw_ocr_text: "BRITANNIA GOOD DAY CASHEW... MRP 35.00 Net Wt. 250g..."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [resolvedParams.id]);

  if (loading) return <div className="p-8 text-center text-text-muted font-mono uppercase tracking-wide">Loading Report...</div>;

  const getStatusInfo = (status) => {
    switch(status) {
      case 'PASS': return { color: 'var(--color-pass)', bg: 'var(--color-pass-bg)', icon: ShieldCheck };
      case 'POTENTIAL NON-COMPLIANCE': return { color: 'var(--color-noncompliant)', bg: 'var(--color-noncompliant-bg)', icon: ShieldAlert };
      case 'MANUAL REVIEW': return { color: 'var(--color-review)', bg: 'var(--color-review-bg)', icon: AlertTriangle };
      case 'NOT APPLICABLE': return { color: 'var(--color-not-applicable)', bg: 'var(--color-not-applicable-bg)', icon: MinusCircle };
      default: return { color: 'var(--color-not-verified)', bg: 'var(--color-not-verified-bg)', icon: EyeOff };
    }
  };

  const StampBadge = ({ status, ruleId, size = 'sm' }) => {
    const { color, bg, icon: Icon } = getStatusInfo(status);
    const isLarge = size === 'lg';
    
    return (
      <div 
        className={`stamp-badge animate-stamp ${isLarge ? 'border-[3px] p-4' : 'border-2 p-2'}`} 
        style={{ borderColor: color, backgroundColor: bg }}
      >
        <div className="flex items-center gap-2">
          <Icon className={isLarge ? 'w-6 h-6' : 'w-4 h-4'} style={{ color }} strokeWidth={2} />
          <span className={`font-mono font-bold uppercase tracking-wide`} style={{ color, fontSize: isLarge ? '1rem' : '0.7rem' }}>
            {status}
          </span>
        </div>
        {ruleId && (
          <span className="font-mono text-xs opacity-80 mt-1" style={{ color }}>{ruleId}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">{report.product_name || 'Verification Report'}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm font-mono text-text-secondary">
            <span>ID: {report.id}</span>
            <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
        <button onClick={() => window.print()} className="gov-btn-outline hidden md:block">
          Download PDF
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pt-4 items-start">
        {/* Left Column */}
        <div className="w-full lg:w-[40%] space-y-6">
          <div className="gov-card p-2 bg-surface">
            {/* Placeholder for bounded image overlay */}
            <div className="aspect-[3/4] bg-navy-100 flex items-center justify-center border border-border">
              <span className="text-text-muted font-mono text-sm uppercase">Original Scan Evidence</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[60%] space-y-8">
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted mb-2">Final Verification Status</p>
              <StampBadge status={report.overall_status} size="lg" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Extracted Data Log</h3>
            <div className="gov-card">
              <table className="gov-table w-full">
                <tbody>
                  {Object.entries(report.extracted_fields || {}).map(([k, v]) => (
                    <tr key={k}>
                      <td className="w-1/2 py-2 px-4 text-xs font-semibold uppercase tracking-wide text-text-secondary border-b border-border">
                        {k.replace(/_/g, ' ')}
                      </td>
                      <td className="w-1/2 py-2 px-4 font-mono text-sm text-text-primary border-b border-border">
                        {v ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-pass shrink-0"></span>
                            {v}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-noncompliant shrink-0"></span>
                            <span className="text-noncompliant">Missing</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Rule Compliance Details</h3>
            <div className="space-y-3">
              {report.rule_checks?.map((check, i) => (
                <div key={i} className="gov-card p-4 flex flex-col sm:flex-row gap-4 items-start bg-surface-alt">
                  <div className="shrink-0 mt-1">
                    <StampBadge status={check.status} />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-text-muted">{check.rule_id}</span>
                      <span className="font-semibold text-text-primary text-sm">{check.name}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{check.detail}</p>
                    
                    <button 
                      onClick={() => setExpandedRule(expandedRule === i ? null : i)}
                      className="flex items-center gap-1 text-xs font-semibold text-navy-900 uppercase tracking-wide hover:underline mt-2"
                    >
                      {expandedRule === i ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                      {expandedRule === i ? 'Hide Evidence' : 'Show Evidence'}
                    </button>
                    
                    {expandedRule === i && (
                      <div className="mt-3 p-3 bg-navy-900 text-surface rounded-sm border border-navy-700">
                        <p className="font-mono text-xs whitespace-pre-wrap">{report.raw_ocr_text.substring(0, 100)}...</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-alt border-t border-border p-4 z-40">
        <button onClick={() => window.print()} className="w-full gov-btn">
          Download PDF Report
        </button>
      </div>
    </div>
  );
}
