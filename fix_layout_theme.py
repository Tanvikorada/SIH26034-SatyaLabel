import re

with open('frontend/app/layout.jsx', 'r', encoding='utf-8') as f:
    layout = f.read()

old_viewport = """export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',"""

new_viewport = """export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#090a0f' }
  ],
  width: 'device-width',"""

layout = layout.replace(old_viewport, new_viewport)

with open('frontend/app/layout.jsx', 'w', encoding='utf-8') as f:
    f.write(layout)
print("Updated layout.jsx themeColor")
