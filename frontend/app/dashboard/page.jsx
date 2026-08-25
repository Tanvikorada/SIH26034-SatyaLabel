"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/dashboard/stats`);
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        setStats(json.data || json);
      } catch {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, [router]);

  return (
    <AppLayout>
      {/*  Header Section  */}

<div className="flex justify-between items-end pb-2 border-b border-slate-silver/20">

<div>

<h1 className="font-headline-md text-headline-md text-midnight-navy">Dashboard</h1>

<p className="font-body-md text-body-md text-slate-silver mt-1">Daily Overview &amp; Critical Alerts</p>

</div>

<button className="bg-midnight-navy text-on-primary font-label-caps text-label-caps px-4 py-2 rounded uppercase tracking-wide hover:translate-y-px transition-transform duration-150 shadow-[0_4px_14px_0_rgba(15,23,42,0.39)]">

                Initiate Audit

            </button>

</div>

{/*  Stacked Metric Cards  */}

<div className="flex flex-col gap-4">

{/*  Metric Card 1  */}

<div className="bg-studio-white border border-slate-silver/20 rounded p-4 relative overflow-hidden group">

<div className="absolute inset-0 bg-gradient-to-br from-cloud to-transparent opacity-50 z-0"></div>

<div className="relative z-10 flex justify-between items-start">

<div>

<p className="font-label-caps text-label-caps text-slate-silver uppercase tracking-wider">Pending Inspections</p>

<h2 className="font-display-lg-mobile text-display-lg-mobile text-midnight-navy font-bold mt-2">12</h2>

<div className="flex items-center gap-1 mt-2 text-error">

<span className="material-symbols-outlined text-[16px]">trending_up</span>

<span className="font-data-mono text-data-mono text-xs">+3 from yesterday</span>

</div>

</div>

<div className="p-2 bg-error-container text-on-error-container rounded border border-error/20">

<span className="material-symbols-outlined" data-weight="fill">warning</span>

</div>

</div>

</div>

{/*  Metric Card 2  */}

<div className="bg-studio-white border border-slate-silver/20 rounded p-4 relative overflow-hidden">

<div className="relative z-10 flex justify-between items-start">

<div>

<p className="font-label-caps text-label-caps text-slate-silver uppercase tracking-wider">Completed (Week)</p>

<h2 className="font-display-lg-mobile text-display-lg-mobile text-midnight-navy font-bold mt-2">45</h2>

<div className="flex items-center gap-1 mt-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">trending_flat</span>

<span className="font-data-mono text-data-mono text-xs">Consistent load</span>

</div>

</div>

<div className="p-2 bg-cloud text-midnight-navy rounded border border-slate-silver/20">

<span className="material-symbols-outlined">assignment_turned_in</span>

</div>

</div>

</div>

{/*  Metric Card 3  */}

<div className="bg-midnight-navy text-on-primary border border-midnight-navy rounded p-4 relative overflow-hidden">

<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-silver/30 via-midnight-navy to-midnight-navy z-0"></div>

<div className="relative z-10 flex justify-between items-start">

<div>

<p className="font-label-caps text-label-caps text-primary-fixed-dim uppercase tracking-wider">Compliance Score</p>

<h2 className="font-display-lg-mobile text-display-lg-mobile font-bold mt-2">92.4%</h2>

<div className="flex items-center gap-1 mt-2 text-primary-fixed">

<span className="font-data-mono text-data-mono text-xs">Network Average: 88%</span>

</div>

</div>

<div className="p-2 bg-white/10 text-white rounded border border-white/20">

<span className="material-symbols-outlined">verified_user</span>

</div>

</div>

</div>

</div>

{/*  Recent Inspections Vertical List  */}

<div className="mt-4 flex flex-col gap-3">

<div className="flex justify-between items-center mb-2">

<h3 className="font-headline-sm text-headline-sm text-midnight-navy border-b border-midnight-navy pb-1">Recent Inspections</h3>

<button className="font-label-caps text-label-caps text-slate-silver hover:text-midnight-navy uppercase flex items-center gap-1 transition-colors duration-150">

                    View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>

</button>

</div>

{/*  List Item 1  */}

<div className="bg-studio-white border border-slate-silver/20 rounded p-4 flex flex-col gap-3 hover:bg-cloud transition-colors duration-150">

<div className="flex justify-between items-start">

<div>

<div className="flex items-center gap-2 mb-1">

<span className="bg-error/10 text-error border border-error/20 font-label-caps text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">High Risk</span>

<span className="font-data-mono text-data-mono text-slate-silver text-xs">ID: INSP-2023-882</span>

</div>

<h4 className="font-body-lg text-body-lg text-midnight-navy font-semibold">Stark Industries Facility Alpha</h4>

</div>

<button className="text-slate-silver hover:text-midnight-navy">

<span className="material-symbols-outlined">more_vert</span>

</button>

</div>

<div className="flex flex-col gap-1 border-t border-cloud pt-2 mt-1">

<div className="flex items-center gap-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">calendar_today</span>

<span className="font-body-md text-body-md text-sm">Oct 24, 2023 • 14:30 EST</span>

</div>

<div className="flex items-center gap-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">person</span>

<span className="font-body-md text-body-md text-sm">Lead: Agent Coulson</span>

</div>

</div>

</div>

{/*  List Item 2  */}

<div className="bg-studio-white border border-slate-silver/20 rounded p-4 flex flex-col gap-3 hover:bg-cloud transition-colors duration-150">

<div className="flex justify-between items-start">

<div>

<div className="flex items-center gap-2 mb-1">

<span className="bg-slate-silver/10 text-midnight-navy border border-slate-silver/20 font-label-caps text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Under Review</span>

<span className="font-data-mono text-data-mono text-slate-silver text-xs">ID: INSP-2023-881</span>

</div>

<h4 className="font-body-lg text-body-lg text-midnight-navy font-semibold">Wayne Enterprises Logistics Center</h4>

</div>

<button className="text-slate-silver hover:text-midnight-navy">

<span className="material-symbols-outlined">more_vert</span>

</button>

</div>

<div className="flex flex-col gap-1 border-t border-cloud pt-2 mt-1">

<div className="flex items-center gap-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">calendar_today</span>

<span className="font-body-md text-body-md text-sm">Oct 23, 2023 • 09:15 EST</span>

</div>

<div className="flex items-center gap-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">person</span>

<span className="font-body-md text-body-md text-sm">Lead: Maria Hill</span>

</div>

</div>

</div>

{/*  List Item 3  */}

<div className="bg-studio-white border border-slate-silver/20 rounded p-4 flex flex-col gap-3 hover:bg-cloud transition-colors duration-150">

<div className="flex justify-between items-start">

<div>

<div className="flex items-center gap-2 mb-1">

<span className="bg-slate-silver/10 text-midnight-navy border border-slate-silver/20 font-label-caps text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Cleared</span>

<span className="font-data-mono text-data-mono text-slate-silver text-xs">ID: INSP-2023-880</span>

</div>

<h4 className="font-body-lg text-body-lg text-midnight-navy font-semibold">Oscorp Chemical Processing</h4>

</div>

<button className="text-slate-silver hover:text-midnight-navy">

<span className="material-symbols-outlined">more_vert</span>

</button>

</div>

<div className="flex flex-col gap-1 border-t border-cloud pt-2 mt-1">

<div className="flex items-center gap-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">calendar_today</span>

<span className="font-body-md text-body-md text-sm">Oct 20, 2023 • 11:00 EST</span>

</div>

<div className="flex items-center gap-2 text-slate-silver">

<span className="material-symbols-outlined text-[16px]">person</span>

<span className="font-body-md text-body-md text-sm">Lead: Nick Fury</span>

</div>

</div>

</div>

</div>
    </AppLayout>
  );
}
