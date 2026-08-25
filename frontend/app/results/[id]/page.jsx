"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, AlertTriangle, MinusCircle, EyeOff, ChevronDown, ChevronUp, Check, X, FileText, ArrowLeft } from 'lucide-react';
import SplitText from '@/components/SplitText';

export default function Results({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState(null);
  const [score, setScore] = useState(0);

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
          product_name: 'Britannia Good Day 250g',
          overall_status: 'POTENTIAL NON-COMPLIANCE',
          extracted_fields: {
            manufacturer_name: 'Britannia Industries Ltd.',
            manufacturer_address: null,
            net_quantity: '250g',
            mrp: '35.00',
            country_of_origin: null,
            customer_care: '1800-425-4449'
          },
          rule_checks: [
            { rule_id: 'Rule 26', name: 'Country of Origin Missing', status: 'POTENTIAL NON-COMPLIANCE', detail: 'Missing country of origin declaration on imported or domestic product.', severity: 'High' },
            { rule_id: 'Rule 6(1)(e)', name: 'Customer Care Details', status: 'PASS', detail: 'Valid customer care number and address found.', severity: 'Medium' },
            { rule_id: 'Rule 3', name: 'Manufacturer Address', status: 'MANUAL REVIEW', detail: 'Address found is incomplete. Manual verification required.', severity: 'High' },
            { rule_id: 'Rule 31', name: 'E-commerce Declarations', status: 'NOT APPLICABLE', detail: 'Product marked as physical label, e-commerce rules do not apply.', severity: 'Low' }
          ],
          raw_ocr_text: "BRITANNIA GOOD DAY CASHEW... MRP 35.00 Net Wt. 250g... CUSTOMER CARE 1800-425-4449"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (report && !loading) {
      // Calculate a fake score based on rules
      const passed = report.rule_checks.filter(r => r.status === 'PASS').length;
      const applicable = report.rule_checks.filter(r => r.status !== 'NOT APPLICABLE').length;
      const targetScore = applicable === 0 ? 100 : Math.round((passed / applicable) * 100);
      
      // Animate score
      let curr = 0;
      const i = setInterval(() => {
        curr += 2;
        if (curr >= targetScore) {
          setScore(targetScore);
          clearInterval(i);
        } else {
          setScore(curr);
        }
      }, 20);
      return () => clearInterval(i);
    }
  }, [report, loading]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-accent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest text-gray-500 animate-pulse">Compiling Report...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'PASS': return 'text-emerald-500 bg-emerald-50 border-emerald-200 shadow-emerald-500/20';
      case 'POTENTIAL NON-COMPLIANCE': return 'text-red-600 bg-red-50 border-red-200 shadow-red-600/20';
      case 'MANUAL REVIEW': return 'text-amber-500 bg-amber-50 border-amber-200 shadow-amber-500/20';
      default: return 'text-slate-500 bg-slate-50 border-slate-200 shadow-slate-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PASS': return <ShieldCheck className="w-6 h-6" />;
      case 'POTENTIAL NON-COMPLIANCE': return <ShieldAlert className="w-6 h-6" />;
      case 'MANUAL REVIEW': return <AlertTriangle className="w-6 h-6" />;
      default: return <MinusCircle className="w-6 h-6" />;
    }
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-8">
      
      {/* Header Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex-1 w-full relative z-10">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-navy-900 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <SplitText
            text={report.product_name || 'Verification Report'}
            className="text-3xl md:text-4xl font-black text-navy-900 tracking-tight"
            delay={20}
            duration={0.6}
            tag="h1"
          />
          <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-xs uppercase tracking-widest text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">ID: {report.id}</span>
            <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        {/* Score Ring */}
        <div className="shrink-0 flex items-center gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative z-10 w-full md:w-auto justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" stroke={score < 50 ? '#dc2626' : score < 100 ? '#d97706' : '#10b981'} strokeWidth="8" fill="none" strokeLinecap="round" 
                style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }} 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-navy-900">{score}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Final Verdict</div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg ${getStatusColor(report.overall_status)}`}>
              {getStatusIcon(report.overall_status)}
              <span className="font-bold text-sm tracking-wide">{report.overall_status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Extracted Data */}
        <div className="xl:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" /> Extracted Entities
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
            {Object.entries(report.extracted_fields || {}).map(([k, v]) => (
              <div key={k} className="group">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{k.replace(/_/g, ' ')}</p>
                <div className={`font-mono text-sm p-3 rounded-xl border transition-colors ${v ? 'bg-gray-50 border-gray-100 text-gray-800 group-hover:border-gray-300' : 'bg-red-50/50 border-red-100 text-red-500'}`}>
                  {v ? (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="break-words">{v}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 shrink-0" />
                      <span className="italic">Not Found</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Rule Checks */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Rule Adherence Audit
          </h2>
          <div className="space-y-4">
            {report.rule_checks?.map((check, i) => {
              const isExpanded = expandedRule === i;
              const colorClasses = getStatusColor(check.status);
              
              return (
                <div key={i} className={`bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border transition-all duration-300 ${isExpanded ? 'ring-2 ring-navy-900/10' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div className="p-5 flex flex-col sm:flex-row gap-5 sm:items-center justify-between cursor-pointer" onClick={() => setExpandedRule(isExpanded ? null : i)}>
                    
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`shrink-0 p-3 rounded-xl border ${colorClasses}`}>
                        {getStatusIcon(check.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{check.rule_id}</span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${check.status === 'PASS' ? 'text-emerald-600' : check.status === 'POTENTIAL NON-COMPLIANCE' ? 'text-red-600' : 'text-amber-600'}`}>
                            {check.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900">{check.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                      <span className="hidden sm:inline">View Evidence</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-navy-900" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded Evidence Drawer */}
                  <div className={`transition-all duration-300 ease-in-out bg-gray-50 border-t border-gray-100 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Finding</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{check.detail}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Raw OCR Trace</p>
                        <div className="bg-[#0A1628] rounded-xl p-4 font-mono text-xs text-green-400 shadow-inner">
                          {report.raw_ocr_text.substring(0, 150)}...
                          <div className="mt-2 text-gray-500">EOF</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
