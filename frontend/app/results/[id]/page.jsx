"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '../../../components/NavBar';

export default function Results() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOcr, setShowOcr] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1';

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await fetch(`${API}/scans/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        } else {
          // Mock data for demo if not found
          setResult({
            id: id,
            product_name: 'Demo Product',
            category: 'food',
            overall_status: 'POTENTIAL NON-COMPLIANCE',
            compliance_score: 65,
            extracted_fields: {
              'MRP': '₹150.00',
              'Net Quantity': 'Not found',
              'Manufacture Date': '12/08/2025',
              'Manufacturer Details': 'Demo Corp Ltd, Mumbai'
            },
            rule_results: [
              { id: 'R1', title: 'MRP Declaration', status: 'PASS', detail: 'MRP is clearly stated with ₹ symbol', severity: 'low' },
              { id: 'R2', title: 'Net Quantity', status: 'FAIL', detail: 'Net quantity missing from principal display panel', severity: 'high' },
              { id: 'R3', title: 'Customer Care Details', status: 'REVIEW', detail: 'Email present but phone number is illegible', severity: 'medium' }
            ],
            raw_ocr: 'DEMO PRODUCT\nMRP ₹150.00\nMFG: 12/08/2025\nDemo Corp Ltd\nMumbai - 400001\nEmail: care@demo.com\n'
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchResult();
  }, [id, router, API]);

  const getStatusConfig = (status) => {
    switch(status?.toUpperCase()) {
      case 'PASS': return { color: 'var(--pass)', class: 'badge-pass' };
      case 'POTENTIAL NON-COMPLIANCE':
      case 'FAIL': return { color: 'var(--fail)', class: 'badge-fail' };
      case 'MANUAL REVIEW':
      case 'REVIEW': return { color: 'var(--review)', class: 'badge-review' };
      case 'NOT APPLICABLE': return { color: 'var(--na)', class: 'badge-na' };
      case 'NOT VERIFIED': return { color: 'var(--nv)', class: 'badge-nv' };
      default: return { color: 'var(--text-secondary)', class: 'badge-neutral' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 animate-spin text-[var(--accent)] mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <div className="text-[var(--text-secondary)]">Loading results...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const statusConfig = getStatusConfig(result.overall_status);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {/* Top Banner Card */}
        <div className="card-raised p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: statusConfig.color }}></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="text-sm font-mono text-[var(--text-muted)] mb-2">Scan ID: {result.id}</div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">{result.product_name}</h1>
              <div className="text-[var(--text-secondary)] capitalize mb-6">{result.category} Category</div>
              <div className={`badge px-4 py-2 text-sm ${statusConfig.class}`}>
                <span className="badge-dot bg-current"></span>
                {result.overall_status}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-[var(--text-secondary)] text-sm mb-1">Compliance Score</div>
                <div className="text-sm font-medium">Based on LML Rules</div>
              </div>
              <div className="gauge w-32 h-32" style={{ background: `conic-gradient(${statusConfig.color} ${result.compliance_score}%, var(--bg-raised) 0)` }}>
                <div className="gauge-inner w-28 h-28">
                  <div className="text-3xl font-display font-bold" style={{ color: statusConfig.color }}>
                    {result.compliance_score}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rule Checks */}
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-semibold mb-4">Rule Checks</h2>
            
            <div className="space-y-4">
              {result.rule_results?.map((rule, idx) => {
                const ruleStatus = getStatusConfig(rule.status);
                return (
                  <div key={idx} className="card-sm p-5 hover:border-[var(--border-bright)] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`status-dot ${ruleStatus.class.replace('badge', 'status-dot')}`}></span>
                        <h3 className="font-medium text-white">{rule.title}</h3>
                      </div>
                      <span className={`badge ${ruleStatus.class}`}>{rule.status}</span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] pl-5 mt-2">
                      {rule.detail}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Extracted Fields */}
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-semibold mb-4">Extracted Fields</h2>
            
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(result.extracted_fields || {}).map(([key, value], idx) => (
                    <tr key={idx} className="table-row">
                      <th className="py-4 px-6 font-medium text-[var(--text-secondary)] w-1/3 bg-[var(--bg-surface)]">{key}</th>
                      <td className={`py-4 px-6 ${value === 'Not found' ? 'text-[var(--fail)] font-medium' : 'text-white'}`}>
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setShowOcr(!showOcr)} 
                className="btn btn-secondary w-full justify-between"
              >
                Show Raw OCR Text
                <svg className={`w-4 h-4 transition-transform ${showOcr ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {showOcr && (
                <div className="mt-4 animate-fade-in-up">
                  <pre className="bg-[var(--bg-void)] border border-[var(--border-muted)] rounded-xl p-4 text-xs font-mono text-[var(--text-faint)] overflow-x-auto whitespace-pre-wrap">
                    {result.raw_ocr}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
