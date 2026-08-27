import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Replace downloadPDF function
pdf_old = r"const downloadPDF = async \(\) => \{[\s\S]*?toast\.error\(`PDF Failed: \$\{err\.message \|\| 'Check console'\}`, \{ id: toastId \}\);\s*\}\s*\};"
pdf_new = """const downloadPDF = () => {
    toast.info('Opening Print Dialog. Save as PDF.');
    setTimeout(() => window.print(), 500);
  };"""

page = re.sub(pdf_old, pdf_new, page)

# Wrap buttons in print:hidden
buttons_old = """<div className="mt-8 flex flex-col md:flex-row gap-3 max-w-[400px] ml-auto">"""
buttons_new = """<div className="mt-8 flex flex-col md:flex-row gap-3 max-w-[400px] ml-auto print:hidden">"""
page = page.replace(buttons_old, buttons_new)

# Ensure Navbar has print:hidden in the page just in case
page = page.replace("<NavBar />", "<div className=\"print:hidden\"><NavBar /></div>")

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated PDF logic in page.jsx")
