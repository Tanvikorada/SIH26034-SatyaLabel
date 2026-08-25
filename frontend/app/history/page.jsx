'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { scans, reports } from '@/lib/api';

// ─── STATUS CONFIG (consistent throughout, spec 06) ──────────────────────────
const SC = {
  compliant:    { label: 'Compliant',     color: 'bg-green-900/40 text-green-400 border-green-700/50',  dot: 'bg-green-500' },
  non_compliant:{ label: 'Non-Compliant', color: 'bg-red-900/40   text-red-400   border-red-700/50',    dot: 'bg-red-500' },
  needs_review: { label: 'Needs Review',  color: 'bg-amber-900/40 text-amber-400 border-amber-700/50',  dot: 'bg-amber-500' },
  processing:   { label: 'Processing',    color: 'bg-slate-800    text-slate-400 border-slate-600',      dot: 'bg-slate-400 animate-pulse' },
  failed:       { label: 'Failed',        color: 'bg-red-950/50   text-red-500   border-red-900',        dot: 'bg-red-600' },
};

// Filter chip values
const FILTERS = [
  { value: '',              label: 'All' },
  { value: 'compliant',    label: 'Compliant' },
  { value: 'non_compliant',label: 'Non-Compliant' },
  { value: 'needs_review', label: 'Needs Review' },
];

function StatusBadge({ status }) {
  const s = SC[status] || SC.needs_review;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function HistoryPage() {
  const [data, setData]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [compliance, setCompliance] = useState('');
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading]     = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await scans.list({
        page, limit: 15,
        compliance: compliance || undefined,
        search: search || undefined,
      });
      // API returns { scans, total, page, total_pages }
      setData(res.scans || res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || res.totalPages || 1);
    } catch (e) {
      console.error('[History] fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  }, [page, compliance, search]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setCompliance('');
    setPage(1);
  };

  const handleDownload = async (scanId, e) => {
    e.stopPropagation();
    setDownloadingId(scanId);
    try {
      await reports.download(scanId);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const hasFilters = search || compliance;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-amber-400">🗂️</span> Scan Repository
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total > 0 ? `${total} scans archived` : 'No scans yet'}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-amber-500/20"
        >
          📷 New Scan
        </Link>
      </div>

      {/* ── SEARCH + FILTER CHIPS (spec 06) ──────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0 max-w-sm">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search product or brand…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-[#1a2035] border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2.5 text-sm transition-all placeholder:text-slate-600 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm transition-colors font-medium"
          >
            Search
          </button>
        </form>

        {/* Status filter chips (spec 06) */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setCompliance(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                ${compliance === f.value
                  ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-[#1a2035] text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* ── TABLE ─────────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-slate-800/60 bg-[#131829]">
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Product / Brand</th>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Score</th>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Violations</th>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Source</th>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/40">
                    <td className="px-5 py-4"><div className="skeleton h-4 w-32 rounded" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-5 w-20 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-4 w-10 rounded" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-4 w-16 rounded" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
                    <td className="px-5 py-4"><div className="skeleton h-4 w-16 rounded" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="space-y-3">
                      <div className="text-4xl">📭</div>
                      <p className="text-slate-400 font-medium">
                        {hasFilters ? 'No scans match your filters.' : 'No scans in the repository yet.'}
                      </p>
                      {hasFilters ? (
                        <button onClick={clearFilters} className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
                          Clear filters →
                        </button>
                      ) : (
                        <Link href="/upload" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
                          Upload your first label →
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((scan, i) => {
                  const name    = scan.product_name || scan.productName || 'Unknown';
                  const brand   = scan.brand_name   || scan.brandName   || null;
                  const status  = scan.overall_compliance || scan.overallCompliance || scan.overallStatus;
                  const score   = scan.compliance_score  ?? scan.complianceScore  ?? null;
                  const totalV  = scan.total_violations  ?? scan.totalViolations  ?? 0;
                  const highV   = scan.high_violations   ?? scan.highViolations   ?? scan.criticalViolations ?? 0;
                  const srcType = scan.source_type || scan.sourceType || 'physical_label';
                  const date    = scan.created_at || scan.createdAt;
                  const engine  = scan.ocr_engine || scan.ocr_engine_used || scan.ocrEngineUsed;

                  return (
                    <tr
                      key={scan.id}
                      className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/results/${scan.id}`}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-white text-sm font-semibold leading-none">{name}</p>
                        {brand && <p className="text-slate-500 text-xs mt-0.5">{brand}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: (score ?? 0) >= 80 ? '#4ade80' : (score ?? 0) >= 50 ? '#fbbf24' : '#f87171' }}
                        >
                          {score !== null ? `${score}%` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {highV > 0 && (
                            <span className="text-[10px] font-bold bg-red-900/60 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded">
                              {highV}H
                            </span>
                          )}
                          <span className="text-slate-400 text-xs">{totalV} total</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-500 capitalize">
                          {srcType === 'ecommerce_listing' ? '🛒 E-commerce' : '🏷️ Physical'}
                        </span>
                        {engine && (
                          <p className={`text-[10px] font-mono mt-0.5 ${engine === 'gemini' ? 'text-blue-400' : 'text-slate-600'}`}>
                            {engine}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {date ? new Date(date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: '2-digit',
                        }) : '—'}
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/results/${scan.id}`}
                            className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={e => handleDownload(scan.id, e)}
                            disabled={downloadingId === scan.id}
                            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                          >
                            {downloadingId === scan.id ? (
                              <span className="w-3 h-3 border border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                            ) : '📄'} PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ─────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-500 text-xs">
              Page {page} of {totalPages} · {total} total scans
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                ← Prev
              </button>
              {/* Page numbers */}
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pg = i + Math.max(1, page - 2);
                if (pg > totalPages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${page === pg
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
