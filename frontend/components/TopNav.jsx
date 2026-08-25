"use client";
export default function TopNav({ setMobileOpen }) {
  return (
    <div className="w-full">
      <header className="bg-studio-white w-full h-16 border-b border-slate-silver/20 flex justify-between items-center px-4 lg:px-6 flex-shrink-0 sticky top-0 z-50">

<div className="flex items-center gap-4">

<button aria-label="Menu" onClick={() => setMobileOpen(true)} className="text-midnight-navy hover:bg-cloud p-1 rounded transition-colors duration-150 lg:hidden">

<span className="material-symbols-outlined">menu</span>

</button>

<span className="font-headline-sm text-headline-sm font-bold text-midnight-navy">SatyaLabel</span>

</div>

<div className="flex items-center gap-3">

<button aria-label="Notifications" className="text-midnight-navy hover:text-cloud hover:bg-midnight-navy/10 p-1 rounded transition-colors duration-150">

<span className="material-symbols-outlined" data-icon="notifications">notifications</span>

</button>

<button aria-label="Account" className="text-midnight-navy hover:text-cloud hover:bg-midnight-navy/10 p-1 rounded transition-colors duration-150">

<span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>

</button>

</div>

</header>
    </div>
  );
}
