import re

with open('frontend/public/manifest.json', 'r', encoding='utf-8') as f:
    manifest = f.read()

manifest = manifest.replace('"display": "standalone"', '"display": "fullscreen"')

# Remove hardcoded theme colors so the OS infers it from the page
manifest = re.sub(r'\s*"background_color":\s*"#[0-9a-fA-F]+",', '', manifest)
manifest = re.sub(r'\s*"theme_color":\s*"#[0-9a-fA-F]+",', '', manifest)

with open('frontend/public/manifest.json', 'w', encoding='utf-8') as f:
    f.write(manifest)
print("Updated manifest.json")
