"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function NewScan() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, [router]);

  return (
    <AppLayout>
      {/*  TopNavBar (Shared Component) - Suppressed for task-focused 'New Scan' flow, but kept for context as requested in strict adherence to hybrid layout  */}



{/*  Canvas  */}

<div className="flex-1 overflow-y-auto p-margin-mobile md:p-gutter xl:p-margin-desktop">

<div className="max-w-7xl mx-auto">

{/*  Page Header  */}

<div className="mb-8 border-b border-slate-silver/20 pb-4">

<div className="flex items-center gap-2 mb-2">

<a className="text-slate-silver hover:text-midnight-navy flex items-center gap-1 font-body-md text-body-md" href="#">

<span className="material-symbols-outlined text-sm">arrow_back</span>

                            Back to Overview

                        </a>

</div>

<h2 className="font-headline-md text-headline-md text-midnight-navy">New Regulatory Scan</h2>

<p className="font-body-md text-body-md text-slate-silver mt-1">Configure parameters and initiate an automated compliance assessment.</p>

</div>

{/*  Bento Grid Layout  */}

<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

{/*  Left Column: Inputs & Upload  */}

<div className="lg:col-span-8 flex flex-col gap-6">

{/*  Label Input Parameters Card  */}

<section className="bg-studio-white rounded border border-slate-silver/20">

<div className="px-6 py-4 bg-cloud rounded-t border-b border-slate-silver/20 flex items-center gap-2">

<span className="material-symbols-outlined text-midnight-navy" data-icon="tune">tune</span>

<h3 className="font-headline-sm text-headline-sm text-midnight-navy m-0">Label Input Parameters</h3>

</div>

<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

{/*  Product Name  */}

<div className="col-span-1 md:col-span-2">

<label className="block font-label-caps text-label-caps text-slate-silver uppercase mb-2">Product Name (As listed on packaging)</label>

<input className="w-full bg-studio-white border border-slate-silver/30 rounded px-4 py-2 font-body-md text-body-md text-midnight-navy focus:border-midnight-navy focus:ring-2 focus:ring-midnight-navy/20 outline-none transition-all duration-150" placeholder="e.g., Satya Organic Blend" type="text"/>

</div>

{/*  Manufacturer  */}

<div>

<label className="block font-label-caps text-label-caps text-slate-silver uppercase mb-2">Manufacturer ID / Name</label>

<input className="w-full bg-studio-white border border-slate-silver/30 rounded px-4 py-2 font-body-md text-body-md text-midnight-navy focus:border-midnight-navy focus:ring-2 focus:ring-midnight-navy/20 outline-none transition-all duration-150" placeholder="e.g., MFG-9942" type="text"/>

</div>

{/*  Category Dropdown  */}

<div>

<label className="block font-label-caps text-label-caps text-slate-silver uppercase mb-2">Regulatory Category</label>

<div className="relative">

<select className="w-full bg-studio-white border border-slate-silver/30 rounded px-4 py-2 font-body-md text-body-md text-midnight-navy focus:border-midnight-navy focus:ring-2 focus:ring-midnight-navy/20 outline-none appearance-none transition-all duration-150">

<option disabled="" selected="" value="">Select category...</option>

<option value="food">Food &amp; Beverage (FDA)</option>

<option value="pharma">Pharmaceutical (FDA)</option>

<option value="cosmetics">Cosmetics</option>

<option value="industrial">Industrial Chemicals</option>

</select>

<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-silver pointer-events-none">expand_more</span>

</div>

</div>

</div>

</section>

{/*  Image Acquisition Card  */}

<section className="bg-studio-white rounded border border-slate-silver/20">

<div className="px-6 py-4 bg-cloud rounded-t border-b border-slate-silver/20 flex items-center gap-2">

<span className="material-symbols-outlined text-midnight-navy" data-icon="image_search">image_search</span>

<h3 className="font-headline-sm text-headline-sm text-midnight-navy m-0">Image Acquisition</h3>

</div>

<div className="p-6">

<div className="border-2 border-dashed border-slate-silver/30 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors duration-150 p-12 flex flex-col items-center justify-center cursor-pointer group">

<div className="w-16 h-16 rounded-full bg-studio-white border border-slate-silver/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-150 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

<span className="material-symbols-outlined text-3xl text-midnight-navy" data-icon="cloud_upload">cloud_upload</span>

</div>

<p className="font-headline-sm text-headline-sm text-midnight-navy mb-1">Drag and drop label artwork</p>

<p className="font-body-md text-body-md text-slate-silver text-center">or click to browse local files. <br/>Supported formats: PDF, TIFF, high-res JPG.</p>

</div>

</div>

</section>

</div>

{/*  Right Column: Regulatory Framework  */}

<div className="lg:col-span-4 flex flex-col gap-6">

<section className="bg-studio-white rounded border border-midnight-navy relative h-full min-h-[400px]">

{/*  The "Official" double border technique applied implicitly via ring or inner div  */}

<div className="absolute inset-[1px] border border-studio-white rounded-[3px] pointer-events-none"></div>

<div className="px-6 py-4 border-b border-slate-silver/20 flex items-center justify-between bg-cloud rounded-t relative z-10">

<h3 className="font-headline-sm text-headline-sm text-midnight-navy m-0 flex items-center gap-2">

<span className="material-symbols-outlined text-midnight-navy" data-icon="policy">policy</span>

                                    Active Frameworks

                                </h3>

<span className="bg-midnight-navy/10 text-midnight-navy px-2 py-1 rounded font-label-caps text-label-caps border border-midnight-navy/20">Auto-Detect</span>

</div>

<div className="p-0 relative z-10 flex flex-col h-[calc(100%-60px)]">

<div className="flex-1 overflow-y-auto">

{/*  List Item 1  */}

<div className="px-6 py-4 border-b border-slate-silver/10 hover:bg-cloud transition-colors duration-150 flex items-start gap-3">

<span className="material-symbols-outlined text-slate-silver mt-0.5 text-[20px]" data-icon="check_circle">check_circle</span>

<div>

<p className="font-body-md text-body-md font-semibold text-midnight-navy mb-1">FDA Title 21 CFR Part 101</p>

<p className="font-data-mono text-data-mono text-slate-silver text-xs">Food Labeling Requirements</p>

</div>

</div>

{/*  List Item 2  */}

<div className="px-6 py-4 border-b border-slate-silver/10 hover:bg-cloud transition-colors duration-150 flex items-start gap-3">

<span className="material-symbols-outlined text-slate-silver mt-0.5 text-[20px]" data-icon="check_circle">check_circle</span>

<div>

<p className="font-body-md text-body-md font-semibold text-midnight-navy mb-1">FALCPA of 2004</p>

<p className="font-data-mono text-data-mono text-slate-silver text-xs">Allergen Labeling</p>

</div>

</div>

{/*  List Item 3  */}

<div className="px-6 py-4 border-b border-slate-silver/10 hover:bg-cloud transition-colors duration-150 flex items-start gap-3 opacity-60">

<span className="material-symbols-outlined text-slate-silver mt-0.5 text-[20px]" data-icon="pending">pending</span>

<div>

<p className="font-body-md text-body-md font-semibold text-midnight-navy mb-1">Prop 65 Warning</p>

<p className="font-data-mono text-data-mono text-slate-silver text-xs">Awaiting Category Confirmation</p>

</div>

</div>

</div>

<div className="p-6 bg-cloud/50 border-t border-slate-silver/20 mt-auto">

<button className="w-full bg-midnight-navy text-studio-white font-body-lg text-body-lg py-4 rounded font-semibold hover:bg-on-secondary-fixed active:translate-y-px transition-all duration-150 flex items-center justify-center gap-2">

<span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>

                                        Start Automated Check

                                    </button>

</div>

</div>

</section>

</div>

</div>

</div>

</div>
    </AppLayout>
  );
}
