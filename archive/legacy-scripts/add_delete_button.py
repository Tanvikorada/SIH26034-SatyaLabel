with open('frontend/app/history/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Add handleDelete function
handle_delete_func = """  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click
    if (!confirm('Are you sure you want to delete this scan?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1'}/scans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setScans(scans.filter(s => s.id !== id));
      } else {
        alert('Failed to delete scan.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting scan.');
    }
  };

  useEffect(() => {"""
page = page.replace('  useEffect(() => {', handle_delete_func)

# Replace the arrow column with arrow + delete button
old_col = """{/* Desktop Arrow */}
                <div className="hidden md:block w-1/12 text-right text-text-muted hover:text-[var(--color-primary)] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>"""

new_col = """{/* Desktop Actions */}
                <div className="hidden md:flex w-2/12 justify-end gap-4 text-right text-text-muted transition-colors items-center">
                  <button onClick={(e) => handleDelete(e, s.id)} className="hover:text-red-500 transition-colors p-1" title="Delete Scan">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                  <div className="hover:text-[var(--color-primary)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>"""
page = page.replace(old_col, new_col)

# Also update the mobile CTA to include delete
old_mobile = """{/* Mobile View details CTA */}
                <div className="flex md:hidden items-center text-[13px] text-[var(--color-primary)] font-medium mt-3 gap-1">
                  View full report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>"""
new_mobile = """{/* Mobile View details CTA & Delete */}
                <div className="flex md:hidden items-center justify-between w-full mt-3">
                  <div className="flex items-center text-[13px] text-[var(--color-primary)] font-medium gap-1">
                    View full report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                  <button onClick={(e) => handleDelete(e, s.id)} className="text-text-muted hover:text-red-500 p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>"""
page = page.replace(old_mobile, new_mobile)

# Fix grid width
page = page.replace('<div className="hidden md:flex w-1/4">', '<div className="hidden md:flex w-2/12">')
page = page.replace('<div className="w-full md:w-2/5 font-medium', '<div className="w-full md:w-5/12 font-medium')
page = page.replace('<div className="hidden md:block w-1/4 text-[14px]', '<div className="hidden md:block w-3/12 text-[14px]')

with open('frontend/app/history/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Added delete button to history")
