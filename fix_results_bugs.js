const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

// 1. Fix toast import
fe = fe.replace("import { toast } from 'react-hot-toast';", "import { toast } from 'sonner';");

// 2. Add handleDelete function
const dlPdfStr = "  const downloadPDF = async () => {";
const handleDeleteCode = `  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;
    try {
      const res = await fetch(\`\${API}/scans/\${resolvedParams.id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
      });
      if (res.ok) {
        toast.success('Scan record deleted.');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete scan.');
      }
    } catch (err) {
      toast.error('Error deleting scan.');
    }
  };\n\n`;
fe = fe.replace(dlPdfStr, handleDeleteCode + dlPdfStr);

// 3. Add Delete Button
const actionBtnsStr = `              <button onClick={downloadCSV} className="mello-btn-secondary flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Export CSV
            </button>`;
const deleteBtnCode = `\n            {localStorage.getItem('role') === 'admin' && (
              <button onClick={handleDelete} className="mello-btn-secondary !text-red-500 !border-red-900/30 hover:!bg-red-500/10 flex items-center gap-2 ml-auto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            )}`;
fe = fe.replace(actionBtnsStr, actionBtnsStr + deleteBtnCode);

// 4. Fix text-white to text-text-primary
fe = fe.replace(/text-white/g, "text-text-primary");

fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
console.log("FIXED!");
