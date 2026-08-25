'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboard } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ─── 5-status badge config ────────────────────────────────────────────────────
const SC = {
  'PASS':                    { label: 'Pass',                     dot: 'status-dot-compliant', cls: 'badge-pass' },
  'POTENTIAL NON-COMPLIANCE':{ label: 'Potential Non-Compliance', dot: 'status-dot-fail',      cls: 'badge-fail' },
  'MANUAL REVIEW':           { label: 'Manual Review',            dot: 'status-dot-review',    cls: 'badge-review' },
  'NOT APPLICABLE':          { label: 'Not Applicable',           dot: 'status-dot-na',        cls: 'badge-na' },
  'NOT VERIFIED':            { label: 'Not Verified',             dot: 'status-dot-nv',        cls: 'badge-nv' },
  compliant:     { label: 'Pass',                     dot: 'status-dot-compliant', cls: 'badge-pass' },
  non_compliant: { label: 'Potential Non-Compliance', dot: 'status-dot-fail',      cls: 'badge-fail' },
  needs_review:  { label: 'Manual Review',            dot: 'status-dot-review',    cls: 'badge-review' },
  processing:    { label: 'Processing',               dot: '',                     cls: 'badge-neutral' },
  failed:        { label: 'Failed',                   dot: '',                     cls: 'badge-neutral' },
};

function StatusBadge({ status }) {
  const s = SC[status] || SC['MANUAL REVIEW'];
  return (
    <span className={`badge ${s.cls}`}>
      {s.dot && <span className={`status-dot ${s.dot}`} />}
      {s.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent = false, delay = 0 }) {
  return (
    <div
      className="card-interactive p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center text-base"
          style={{ background: 'var(--bg-raised)' }}
        >
          {icon}
        </span>
      </div>
      <p
        className="text-4xl font-bold tracking-tight"
        style={{
          fontFamily: 'var(--font-display)',
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div
      className="card-sm px-3 py-2.5 text-xs"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: '160px' }}
    >
      <p className="font-mono font-semibold mb-0.5" style={{ color: 'var(--accent)' }}>
        {item?.rule_id || item?.ruleId}
      </p>
      <p style={{ color: 'var(--text-secondary)' }}>
        {payload[0]?.value} violations
      </p>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    dashboard.getStats()
      .then(data => setStats(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="skeleton h-7 w-52 rounded" />
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-[110px] rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 skeleton h-72 rounded-xl" />
          <div className="skeleton h-72 rounded-xl" />
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="card p-10 text-center space-y-4 max-w-xl mx-auto"
        style={{ borderColor: 'var(--fail-border)', background: 'var(--fail-bg)' }}
      >
        <p className="text-3xl">⚠️</p>
        <p className="font-semibold" style={{ color: 'var(--fail)' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-ghost text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Normalise field names ─────────────────────────────────────────────────
  const totalScans        = stats?.total_scans          ?? 0;
  const compliantCount    = stats?.compliant_count       ?? 0;
  const nonCompliantCount = stats?.non_compliant_count   ?? 0;
  const needsReviewCount  = stats?.needs_review_count    ?? 0;
  const notVerifiedCount  = stats?.not_verified_count    ?? 0;
  const totalViolations   = stats?.total_violations      ?? 0;
  const avgScore          = stats?.avg_compliance_score  ?? 0;
  const topViolatedRules  = stats?.top_violated_rules    ?? [];
  const recentScans       = stats?.recent_scans          ?? [];
  const compliantPct      = totalScans > 0 ? Math.round((compliantCount / totalScans) * 100) : 0;

  const pieData = [
    { name: 'Pass',                     value: compliantCount,    color: 'var(--pass)' },
    { name: 'Potential Non-Compliance', value: nonCompliantCount, color: 'var(--fail)' },
    { name: 'Manual Review',            value: needsReviewCount,  color: 'var(--review)' },
    { name: 'Not Verified',             value: notVerifiedCount,  color: 'var(--nv)' },
  ].filter(d => d.value > 0);

  const barData = topViolatedRules.map(r => ({
    ...r,
    shortId: (r.rule_id || r.ruleId || '').replace('Rule ', 'R').slice(0, 10),
    count: Number(r.count || 0),
  }));

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3 animate-fade-in-up">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Enforcement Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Legal Metrology Compliance Overview
            <span
              className="ml-2 badge badge-neutral"
              style={{ verticalAlign: 'middle', fontFamily: 'var(--font-mono)' }}
            >
              {totalScans} scans
            </span>
          </p>
        </div>
        <Link href="/upload" className="btn btn-primary text-sm">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </Link>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Scans"    value={totalScans}       icon="📊" delay={0}  sub="All-time scanned labels" />
        <KpiCard label="Pass Rate"      value={`${compliantPct}%`} icon="✅" delay={60}  sub={`${compliantCount} of ${totalScans} compliant`} accent />
        <KpiCard label="Non-Compliant"  value={nonCompliantCount} icon="⚠️" delay={120} sub={`${totalViolations} total violations`} />
        <KpiCard label="Avg Score"      value={`${avgScore}%`}   icon="📈" delay={180} sub="Mean compliance score" />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar — top violated rules */}
        <div className="lg:col-span-2 card p-5 animate-fade-in-up stagger-2">
          <div className="mb-5">
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Top Violated Rules
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Most common failure points across all scanned labels
            </p>
          </div>

          {barData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <p className="text-3xl">📊</p>
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No violation data yet — scan some labels</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={22}>
                <XAxis
                  dataKey="shortId"
                  tick={{ fill: 'var(--text-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-faint)', fontSize: 10 }}
                  axisLine={false} tickLine={false} allowDecimals={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} fill="var(--accent)" opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie — distribution */}
        <div className="card p-5 animate-fade-in-up stagger-3">
          <h2 className="text-sm font-semibold mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Status Distribution
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Compliance outcomes breakdown</p>

          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40" style={{ color: 'var(--text-faint)' }}>
              No data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={42} outerRadius={68}
                    paddingAngle={3} dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color.startsWith('var') ? undefined : entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: 12,
                      fontFamily: 'var(--font-body)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: d.color.startsWith('var') ? undefined : d.color }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent Scans ────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden animate-fade-in-up stagger-4">
        {/* Table header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-muted)' }}
        >
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Recent Scans
          </h2>
          <Link
            href="/history"
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-muted)' }}>
                {['Product', 'Status', 'Score', 'Violations', 'Date', ''].map(h => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
                    No scans yet.{' '}
                    <Link href="/upload" style={{ color: 'var(--accent)' }}>Upload your first label →</Link>
                  </td>
                </tr>
              ) : recentScans.map((scan, i) => {
                const name   = scan.product_name || scan.productName || 'Unknown';
                const brand  = scan.brand_name   || scan.brandName   || null;
                const status = scan.overall_compliance || scan.overallCompliance || scan.overallStatus;
                const score  = scan.compliance_score  ?? scan.complianceScore  ?? null;
                const totalV = scan.total_violations  ?? scan.totalViolations  ?? 0;
                const highV  = scan.high_violations   ?? scan.highViolations   ?? 0;
                const date   = scan.created_at || scan.createdAt;

                return (
                  <tr
                    key={scan.id || i}
                    className="table-row cursor-pointer"
                    onClick={() => window.location.href = `/results/${scan.id}`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</p>
                      {brand && <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{brand}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{
                          color: (score ?? 0) >= 80 ? 'var(--pass)'
                               : (score ?? 0) >= 50 ? 'var(--review)'
                               : 'var(--fail)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {score !== null ? `${score}%` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {highV > 0 && (
                          <span className="badge badge-fail text-[10px] py-0.5">
                            {highV}H
                          </span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{totalV} total</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                      {date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>View →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
