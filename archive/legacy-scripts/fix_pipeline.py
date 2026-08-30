with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

old_pipeline = """function PipelineSection() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto relative z-10">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-medium tracking-tight mb-3">Live Automated Pipeline</h2>
        <p className="text-[var(--color-text-secondary)]">Experience the architecture continuously at work in real-time.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        <InteractivePipelineCard title="1. Capture" icon={Upload}><UploadMicroApp /></InteractivePipelineCard>
        <InteractivePipelineCard title="2. Extract" icon={ScanLine}><OCRMicroApp /></InteractivePipelineCard>
        <InteractivePipelineCard title="3. Adjudicate" icon={Scale}><RuleMicroApp /></InteractivePipelineCard>
      </div>
    </section>
  );
}"""

new_pipeline = """function PipelineSection() {
  return (
    <section className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto relative z-10 border-t border-[var(--color-border)]">
      <div className="mb-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-primary)]/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-4xl font-medium tracking-tight mb-4">Live Automated Pipeline</h2>
        <p className="text-[var(--color-text-secondary)] text-[16px]">Experience the multi-stage architecture continuously at work in real-time.</p>
      </div>
      
      <div className="relative">
        {/* Animated Connector Line (Desktop) */}
        <div className="hidden md:block absolute top-[125px] left-[16%] right-[16%] h-[2px] bg-[var(--color-border)] z-0 overflow-hidden">
          <motion.div 
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-70"
            animate={{ x: ['-100%', '300%'] }} 
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[280px] relative z-10">
          <div className="relative group hover:-translate-y-2 transition-transform duration-500">
            <InteractivePipelineCard title="1. Capture" icon={Upload}><UploadMicroApp /></InteractivePipelineCard>
            <div className="absolute -inset-1 bg-gradient-to-b from-[var(--color-primary)]/0 to-[var(--color-primary)]/0 group-hover:from-[var(--color-primary)]/20 blur-xl transition-all duration-500 rounded-3xl -z-10" />
          </div>
          
          <div className="relative group hover:-translate-y-2 transition-transform duration-500 md:mt-12">
            <InteractivePipelineCard title="2. Extract" icon={ScanLine}><OCRMicroApp /></InteractivePipelineCard>
            <div className="absolute -inset-1 bg-gradient-to-b from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/20 blur-xl transition-all duration-500 rounded-3xl -z-10" />
          </div>
          
          <div className="relative group hover:-translate-y-2 transition-transform duration-500">
            <InteractivePipelineCard title="3. Adjudicate" icon={Scale}><RuleMicroApp /></InteractivePipelineCard>
            <div className="absolute -inset-1 bg-gradient-to-b from-green-500/0 to-green-500/0 group-hover:from-green-500/20 blur-xl transition-all duration-500 rounded-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}"""

page = page.replace(old_pipeline, new_pipeline)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Pipeline upgraded")
