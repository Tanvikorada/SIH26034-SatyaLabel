import re

with open('frontend/app/layout.jsx', 'r', encoding='utf-8') as f:
    layout = f.read()

# Replace metadata and add viewport
old_metadata = """export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
}"""

new_metadata = """export const metadata = {
  title: 'SatyaLabel',
  description: 'Legal Metrology Compliance Checker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SatyaLabel',
  },
}

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};"""

layout = layout.replace(old_metadata, new_metadata)

# Remove the hardcoded head tags since Next.js metadata API handles it better
head_pattern = r'<head>.*?</head>'
layout = re.sub(head_pattern, '<head></head>', layout, flags=re.DOTALL)

with open('frontend/app/layout.jsx', 'w', encoding='utf-8') as f:
    f.write(layout)
print("Updated layout.jsx with proper PWA metadata and viewportFit: 'cover'")
