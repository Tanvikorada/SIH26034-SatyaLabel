'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { scans, reports } from '@/lib/api';
import ViolationCard from '@/components/ViolationCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

// ─── 5-status display config ──────────────────────────────────────────────────
const STATUS = {
  'PASS': {
    label: 'PASS', icon: '✓',
    color: 'var(--pass)', bg: 'var(--pass-bg)', border: 'var(--pass-border)',
    badgeCls: 'badge-pass',
  },
  'POTENTIAL NON-COMPLIANCE': {
    label: 'POTENTIAL NON-COMPLIANCE', icon: '✕',
    color: 'var(--fail)', bg: 'var(--fail-bg)', border: 'var(--fail-border)',
    badgeCls: 'badge-fail',
  },
  'MANUAL REVIEW': {
    label: 'MANUAL REVIEW', icon: '!',
    color: 'var(--review)', bg: 'var(--review-bg)', border: 'var(--review-border)',
    badgeCls: 'badge-review',
  },
  'NOT APPLICABLE': {
    label: 'NOT APPLICABLE', icon: '—',
    color: 'var(--na)', bg: 'var(--na-bg)', border: 'var(--border)',
    badgeCls: 'badge-na',
  },
  'NOT VERIFIED': {
    label: 'NOT VERIFIED', icon: '?',
    color: 'var(--nv)', bg: 'var(--nv-bg)', border: 'var(--nv-border)',
    badgeCls: 'badge-nv',
  },
  // Legacy aliases
  compliant:     { label: 'PASS',                     icon: '✓', color: 'var(--pass)',   bg: 'var(--pass-bg)',   border: 'var(--pass-border)',   badgeCls: 'badge-pass' },
  non_compliant: { label: 'POTENTIAL NON-COMPLIANCE', icon: '✕', color: 'var(--fail)',   bg: 'var(--fail-bg)',   border: 'var(--fail-border)',   badgeCls: 'badge-fail' },
  needs_review:  { label: 'MANUAL REVIEW',            icon: '!', color: 'var(--review)', bg: 'var(--review-bg)', border: 'var(--review-border)', badgeCls: 'badge-review' },
};

// ─── Fields metadata ──────────────────────────────────────────────────────────
const FIELD_META = {
  product_name:         { label: 'Common / Generic Name',     rule: 'Rule 6(b)' },
  brand_name:           { label: 'Brand Name',                rule: null },
  manufacturer_name:    { label: 'Manufacturer Name',         rule: 'Rule 6 / Rule 10' },
  manufacturer_address: { label: 'Manufacturer Address',      rule: 'Rule 6 / Rule 10' },
  net_quantity:         { label: 'Net Quantity',              rule: 'Rule 6 / Rule 11' },
  mrp:                  { label: 'MRP (incl. all taxes)',     rule: 'Rule 6 / Rule 2' },
  mfg_date:             { label: 'Month & Year of Mfg.',     rule: 'Rule 6' },
  best_before:          { label: 'Best Before / Expiry',     rule: null },
  customer_care:        { label: 'Consumer Care Details',    rule: 'Rule 6' },
  fssai_license:        { label: 'FSSAI Licence No.',        rule: null },
  batch_lot_number:     { label: 'Batch / Lot No.',          rule: null },
  country_of_origin:    { label: 'Country of Origin',        rule: 'Rule 6' },
  ingredients:          { label: 'Ingredients',              rule: null },
};

function FieldsTable({ fields }) {
  const entries = Object.entries(FIELD_META).map(([key, meta]) => ({
    key, meta,
    value: fields?.[key] ?? null,
  }));

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
            {['Declaration', 'Extracted Value'].map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(({ key, meta, value }, i) => (
            <tr
              key={key}
              className="table-row"
              style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
            >
              <td className="px-4 py-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{meta.label}</p>
                {meta.rule && (
                  <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-faint)' }}>{meta.rule}</p>
                )}
              </td>
              <td className="px-4 py-3">
                {value ? (
                  <p className="text-sm font-medium max-w-xs" style={{ color: 'var(--text-primary)' }}>{value}</p>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block opacity-50" />
                    Not detected
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreRing({ score, color }) {
  const r    = 44;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(100, score || 0));
  const dash = circ * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 110, height: 110 }}>
        <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg-raised)" strokeWidth="10" />
          <circle
            cx="55" cy="55" r={r} fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-black" style={{ color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {pct}%
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-faint)' }}>score</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams();
  const [scan, setScan]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [rawOcrOpen, setRawOcrOpen]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    scans.get(id)
      .then(data => { if (!cancelled) setScan(data); })
      .catch(e   => { if (!cancelled) setError(e.message); })
      .finally(()=> { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleDownloadPDF = useCallback(async () => {
    setDownloading(true);
    try { await reports.download(id); }
    catch (e) { alert('Report download failed: ' + e.message); }
    finally { setDownloading(false); }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--accent)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading compliance results…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card p-10 text-center space-y-4" style={{ borderColor: 'var(--fail-border)', background: 'var(--fail-bg)' }}>
          <p className="text-3xl">⚠️</p>
          <p className="font-semibold" style={{ color: 'var(--fail)' }}>{error}</p>
          <Link href="/dashboard" className="text-sm" style={{ color: 'var(--accent)' }}>← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const violations    = scan?.violations || [];
  const fields        = scan?.extracted_fields || scan?.extractedFields || {};
  const rawStatus     = scan?.overall_compliance || scan?.overallCompliance || scan?.overallStatus || 'MANUAL REVIEW';
  const sc            = STATUS[rawStatus] || STATUS['MANUAL REVIEW'];
  const score         = scan?.compliance_score ?? scan?.complianceScore ?? 0;
  const highV         = violations.filter(v => v.severity === 'high' || v.severity === 'critical');
  const estimatedOnly = violations.every(v =>
    v.status === 'MANUAL REVIEW' || v.status === 'NOT VERIFIED' || v.status === 'estimated_fail'
  ) && violations.length > 0;
  const imageUrl = scan?.image_url ? `${API_BASE}${scan.image_url}` : null;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Breadcrumb + Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs flex items-center gap-1 mb-2 transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
          >
            ← Dashboard
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {scan?.product?.product_name || scan?.product?.productName || 'Unknown Product'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            {scan?.product?.brand_name || ''}
            {scan?.product?.brand_name ? ' · ' : ''}
            {scan?.source_type?.replace('_', ' ')}
            {' · '}
            Scan <span>{id?.slice(0, 8)}…</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="btn btn-ghost text-xs"
          >
            {downloading
              ? <span className="w-3 h-3 rounded-full animate-spin" style={{ border: '1.5px solid var(--border)', borderTop: '1.5px solid var(--text-secondary)' }} />
              : '↓'
            }
            PDF Report
          </button>
          <Link href="/upload" className="btn btn-primary text-xs">
            + New Scan
          </Link>
        </div>
      </div>

      {/* ── Status banner ─────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: `linear-gradient(135deg, ${sc.bg}, transparent)`,
          border: `1px solid ${sc.border}`,
          boxShadow: `0 0 32px ${sc.bg}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
            style={{
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              color: sc.color,
              fontFamily: 'var(--font-display)',
              boxShadow: `0 0 24px ${sc.bg}`,
            }}
          >
            {sc.icon}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              Compliance Status
            </p>
            <h2
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: sc.color }}
            >
              {sc.label}
            </h2>
          </div>
        </div>
        {/* Stats */}
        <div className="hidden sm:flex items-center gap-8">
          {[
            { label: 'Rules Checked', value: scan?.total_rules_checked ?? scan?.totalRulesChecked ?? '—', color: 'var(--text-primary)' },
            { label: 'High Severity', value: highV.length, color: 'var(--fail)' },
            { label: 'Total Findings', value: violations.length, color: 'var(--review)' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="space-y-4">

          {/* Image */}
          {imageUrl ? (
            <div className="card overflow-hidden">
              <div className="relative">
                <img
                  src={imageUrl} alt="Product label"
                  className="w-full object-contain max-h-64"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ borderTop: '1px solid var(--border-muted)' }}
              >
                <span className="status-dot shrink-0" style={{ background: sc.color, boxShadow: `0 0 6px ${sc.color}` }} />
                <span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.label}</span>
              </div>
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center gap-3" style={{ color: 'var(--text-faint)' }}>
              <span className="text-3xl">🖼️</span>
              <p className="text-xs">Image not available</p>
            </div>
          )}

          {/* Score */}
          <div className="card p-5 flex flex-col items-center">
            <ScoreRing score={score} color={sc.color} />
          </div>

          {/* OCR details */}
          <div className="card p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              OCR Metadata
            </p>
            {[
              { label: 'Engine',     value: scan?.ocr_engine_used || scan?.ocrEngineUsed || '—' },
              { label: 'Confidence', value: `${(scan?.ocr_confidence_avg ?? scan?.ocrConfidenceAvg ?? 0).toFixed(1)}%` },
              { label: 'Scanned',    value: scan?.created_at ? new Date(scan.created_at).toLocaleString('en-IN') : '—' },
              { label: 'Scan ID',    value: id?.slice(0, 8) + '…' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Severity breakdown */}
          {violations.length > 0 && (
            <div className="card p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                Finding Severity
              </p>
              {[
                { label: 'High / Definite',  count: violations.filter(v => v.severity === 'high' || v.severity === 'critical').length,  color: 'var(--fail)' },
                { label: 'Medium',           count: violations.filter(v => v.severity === 'medium' || v.severity === 'major').length,    color: 'var(--review)' },
                { label: 'Low / Estimated',  count: violations.filter(v => !['high','critical','medium','major'].includes(v.severity)).length, color: 'var(--text-secondary)' },
              ].map(({ label, count, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</span>
                    <span className="text-xs font-bold" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{
                        width: violations.length > 0 ? `${(count / violations.length) * 100}%` : '0%',
                        background: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Fields table */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Extracted Label Declarations
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Rule 6 mandatory fields extracted via OCR
            </p>
            <FieldsTable fields={fields} />
          </div>

          {/* Raw OCR */}
          {scan?.ocr_raw_text && (
            <div className="card overflow-hidden">
              <button
                onClick={() => setRawOcrOpen(o => !o)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-sm transition-colors"
                style={{ color: 'var(--text-muted)', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <span className="flex items-center gap-2 font-medium">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>TXT</span>
                  Raw OCR Text
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Click to {rawOcrOpen ? 'collapse' : 'expand'}</span>
                </span>
                <span className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{rawOcrOpen ? '▲' : '▼'}</span>
              </button>
              {rawOcrOpen && (
                <pre
                  className="px-5 pb-5 text-xs whitespace-pre-wrap leading-relaxed overflow-auto max-h-52 animate-fade-in"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    borderTop: '1px solid var(--border-muted)',
                  }}
                >
                  {scan.ocr_raw_text}
                </pre>
              )}
            </div>
          )}

          {/* Violations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Compliance Findings
              </h2>
              {violations.length > 0 && (
                <span className="badge badge-fail text-[10px]">{violations.length} found</span>
              )}
            </div>

            {violations.length === 0 ? (
              <div
                className="card p-12 text-center space-y-3"
                style={{ borderColor: 'var(--pass-border)', background: 'var(--pass-bg)' }}
              >
                <div className="text-4xl">✅</div>
                <p className="font-bold" style={{ color: 'var(--pass)', fontFamily: 'var(--font-display)' }}>No violations found</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  This product label appears to be fully compliant with the<br />Legal Metrology (Packaged Commodities) Rules, 2011.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations
                  .slice()
                  .sort((a, b) => {
                    const order = { high: 0, critical: 0, medium: 1, major: 1, low: 2, minor: 2 };
                    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
                  })
                  .map((v, i) => (
                    <div key={v.id || i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                      <ViolationCard violation={v} />
                    </div>
                  ))}

                {/* Disclaimer for estimated findings */}
                {estimatedOnly && (
                  <div
                    className="flex gap-3 px-4 py-3.5 rounded-xl text-xs"
                    style={{ background: 'var(--review-bg)', border: '1px solid var(--review-border)', color: 'var(--review)' }}
                  >
                    <span className="shrink-0">ℹ️</span>
                    <span>
                      All findings above require officer verification — do not initiate enforcement action
                      on MANUAL REVIEW or NOT VERIFIED findings alone.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
