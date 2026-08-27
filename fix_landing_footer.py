with open("frontend/app/page.jsx", "r", encoding="utf-8") as f:
    page = f.read()

footer_old = """<div>Smart India Hackathon 2026 Ministry of Consumer Affairs</div>"""
footer_new = """<div className="text-right">
            <div>Smart India Hackathon 2026</div>
            <div className="mt-1 font-medium text-[12px]">Made with <span className="text-red-500 animate-pulse inline-block">❤️</span> by Tanvi</div>
          </div>"""
page = page.replace(footer_old, footer_new)

with open("frontend/app/page.jsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Landing footer upgraded")
