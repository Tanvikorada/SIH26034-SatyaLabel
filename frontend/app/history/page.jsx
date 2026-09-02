"use client";
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // CSV Export Function
  const exportToCSV = () => {
    if (scans.length === 0) return toast.error('No data to export');
    const headers = ['Scan ID', 'Product Name', 'Date', 'Overall Compliance'];
    const csvContent = [
      headers.join(','),
      ...scans.map(s => {
        const name = (s.product_name || s.product?.product_name || 'Unknown').replace(/,/g, '');
        const date = new Date(s.createdAt || s.created_at).toLocaleDateString();
        const status = s.status === 'failed' ? 'FAILED' : (s.overall_compliance || s.status);
        return `${s.id},${name},${date},${status}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SatyaLabel_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click
    if (!confirm('Are you sure you want to delete this scan?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/scans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setScans(scans.filter(s => s.id !== id));
      } else {
        alert('Failed to delete scan.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting scan.');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    const fetchScans = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/scans` + (debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '');
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        const d = json.data || json;
        setScans(Array.isArray(d) ? d : (d.scans || []));
      } catch {
        setScans([{ id: 'mock1', product: { product_name: 'Mock Product' }, status: 'PASS', overall_compliance: 'PASS', createdAt: new Date().toISOString() }]);
      } finally { setLoading(false); }
    };
    fetchScans();
  }, [router, debouncedSearch]);

  if (loading) return <div className="min-h-screen bg-background text-text-primary"><NavBar/><div className="p-10 text-text-secondary text-[14px]">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <NavBar />
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[24px] md:text-[32px] font-medium tracking-tight leading-[1.1] mb-2">Scan Repository</h1>
            <p className="text-[15px] text-text-secondary">Historical record of all compliance checks.</p>
          </div>
          <button onClick={exportToCSV} className="mello-btn-secondary whitespace-nowrap flex items-center gap-2 px-4 py-2 border rounded">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export to CSV
          </button>
        </div>

        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by product name, brand, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mello-input w-full pl-11 py-3 border rounded bg-transparent"
          />
        </div>
        
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.length === 0 && <div className="col-span-full p-10 text-center text-text-muted">No scans found.</div>}
          {scans.map((s, i) => {
            const isPass = s.overall_compliance === 'PASS' || s.overall_compliance === 'pass' || s.overallStatus === 'compliant';
            const isProcessing = s.overall_compliance === 'processing' || s.status === 'processing';
            const badgeClass = isPass ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : (isProcessing ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20');
            const statusText = s.status === 'failed' ? 'FAILED' : (s.overall_compliance || s.status || 'UNKNOWN');
            
            return (
              <div 
                key={i} 
                className="group relative flex flex-col bg-surface/50 dark:bg-white/[0.02] border border-border rounded-[24px] p-6 hover:border-accent hover:shadow-lg transition-all cursor-pointer overflow-hidden" 
                onClick={() => router.push(`/results/${s.id}`)}
              >
                {/* Decorative background glow based on status */}
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[50px] opacity-20 transition-opacity group-hover:opacity-40 ${isPass ? 'bg-emerald-500' : (isProcessing ? 'bg-blue-500' : 'bg-red-500')}`}></div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-[16px] bg-background border border-border flex items-center justify-center shadow-sm">
                    {/* Fallback Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border shadow-sm ${badgeClass}`}>
                    {statusText}
                  </span>
                </div>
                
                <div className="relative z-10 flex-grow">
                  <h3 className="text-[18px] font-bold tracking-tight text-text-primary mb-1 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                    {s.product_name || s.product?.product_name || 'Unknown Product'}
                  </h3>
                  <p className="text-[13px] text-text-muted font-medium mb-6">
                    {s.brand_name || s.product?.brand_name || 'Scan ID: ' + s.id.substring(0,8)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50 relative z-10">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-text-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {new Date(s.createdAt || s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  
                  <button 
                    onClick={(e) => handleDelete(e, s.id)} 
                    className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-text-muted hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-colors" 
                    title="Delete Scan"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
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
