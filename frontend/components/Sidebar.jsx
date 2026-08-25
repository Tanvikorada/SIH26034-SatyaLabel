"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <aside className="bg-cloud dark:bg-midnight-navy h-full flex flex-col py-6">

<div className="px-6 mb-8 flex items-center space-x-3">

<div className="w-10 h-10 bg-midnight-navy rounded flex items-center justify-center">

<span className="material-symbols-outlined text-studio-white" style={{ fontVariationSettings: "'FILL' 1" }}>assured_workload</span>

</div>

<div>

<h1 className="font-headline-md text-headline-md tracking-tight text-midnight-navy dark:text-cloud leading-none">SatyaLabel</h1>

<p className="font-label-caps text-label-caps text-slate-silver mt-1">Government Portal</p>

</div>

</div>

<nav className="flex-1 px-4 space-y-1">

<Link href="#" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150 group" href="#">

<span className="material-symbols-outlined mr-3">dashboard</span>

<span className="font-label-caps text-label-caps">Overview</span>

</Link>

<Link href="#" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150 group" href="#">

<span className="material-symbols-outlined mr-3">verified_user</span>

<span className="font-label-caps text-label-caps">Regulatory Check</span>

</Link>

<Link href="#" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150 group" href="#">

<span className="material-symbols-outlined mr-3">account_balance</span>

<span className="font-label-caps text-label-caps">Entity Management</span>

</Link>

<Link href="#" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150 group" href="#">

<span className="material-symbols-outlined mr-3">gavel</span>

<span className="font-label-caps text-label-caps">Risk Assessment</span>

</Link>

<Link href="#" className="flex items-center px-4 py-2 bg-midnight-navy text-studio-white rounded-lg mx-2 scale-[0.98] transition-transform duration-150 group" href="#">

<span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>

<span className="font-label-caps text-label-caps">Archive</span>

</Link>

<Link href="/settings" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150 group" href="#">

<span className="material-symbols-outlined mr-3">settings</span>

<span className="font-label-caps text-label-caps">System Settings</span>

</Link>

</nav>

<div className="px-6 mt-auto">

<button className="w-full bg-midnight-navy text-studio-white font-label-caps text-label-caps py-3 rounded hover:bg-opacity-90 transition-snappy flex items-center justify-center space-x-2">

<span className="material-symbols-outlined text-sm">play_arrow</span>

<span>Initiate Audit</span>

</button>

</div>

<div className="px-4 mt-6 pt-6 border-t border-slate-silver/20 space-y-1">

<Link href="#" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150" href="#">

<span className="material-symbols-outlined mr-3">help_outline</span>

<span className="font-label-caps text-label-caps">Support</span>

</Link>

<Link href="#" className="flex items-center px-4 py-2 text-slate-silver hover:bg-slate-silver/10 rounded-lg mx-2 transition-colors duration-150" href="#">

<span className="material-symbols-outlined mr-3">logout</span>

<span className="font-label-caps text-label-caps">Sign Out</span>

</Link>

</div>

</aside>
      </div>
    </>
  );
}
