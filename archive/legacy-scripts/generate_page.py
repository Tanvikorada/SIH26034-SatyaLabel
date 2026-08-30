import re

with open('frontend/app/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I will systematically replace each component using Regex or string splits.
# Let's replace the whole file because it's easier to ensure everything is consistent.
