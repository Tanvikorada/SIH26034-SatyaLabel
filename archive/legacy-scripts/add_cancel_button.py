import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# 1. Add cancelScan function
cancel_func = '''
  const cancelScan = async () => {
    try {
      const res = await fetch(${API}/scans//cancel, {
        method: 'POST',
        headers: { 'Authorization': Bearer  }
      });
      if (res.ok) {
        toast.success('Scan cancelled.');
        router.push('/dashboard');
      }
    } catch(err) {
      toast.error('Could not cancel scan');
    }
  };
'''

page = page.replace('const downloadPDF = async () => {', cancel_func + '\n  const downloadPDF = async () => {')

# 2. Add the button to the loading UI
loading_ui = '''
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-[20px] font-medium tracking-tight">Analyzing Label...</h2>
              <p className="text-[14px] text-text-secondary font-mono">Running OCR and Legal Metrology Rules Engine</p>
            </div>
            <button onClick={cancelScan} className="mt-4 px-4 py-2 rounded-full border border-border text-text-secondary hover:text-red-400 hover:border-red-900/50 transition-colors text-sm font-medium">Cancel Scan</button>
'''
page = page.replace('''
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-[20px] font-medium tracking-tight">Analyzing Label...</h2>
              <p className="text-[14px] text-text-secondary font-mono">Running OCR and Legal Metrology Rules Engine</p>
            </div>
'''.strip(), loading_ui.strip())

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
