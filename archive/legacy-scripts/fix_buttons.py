with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Replace Navbar button
page = page.replace(
    '<Link href="/login" className="mello-btn-primary !px-5 !py-2 !text-[14px]">Enter App</Link>',
    '<Link href="/login" className="mello-btn-primary !px-5 !py-2 !text-[14px]">Go to Dashboard</Link>'
)

# Replace Hero button
page = page.replace(
    '<Link href="/login" className="mello-btn-primary !px-7 !py-3 !text-[15px] shadow-lg">Enter App</Link>',
    '<Link href="/login" className="mello-btn-primary !px-7 !py-3 !text-[15px] shadow-lg">Start Scanning</Link>'
)

# Replace Footer button
page = page.replace(
    '<Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex \nitems-center gap-2 shadow-lg">\n          Enter App\n        </Link>',
    '<Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 shadow-lg">\n          Launch App\n        </Link>'
)
page = page.replace(
    """<Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex 
items-center gap-2 shadow-lg">
          Enter App
        </Link>""",
    """<Link href="/login" className="mello-btn-primary !px-10 !py-4 !text-[16px] !rounded-lg inline-flex items-center gap-2 shadow-lg">
          Launch App
        </Link>"""
)

with open('frontend/app/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Buttons renamed")
