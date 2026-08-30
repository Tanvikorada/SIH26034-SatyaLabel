with open('frontend/app/settings/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

page = page.replace('const [showIosPrompt, setShowIosPrompt] = useState(false);', 'const [showIosPrompt, setShowIosPrompt] = useState(false);\n  const [mounted, setMounted] = useState(false);')

with open('frontend/app/settings/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
