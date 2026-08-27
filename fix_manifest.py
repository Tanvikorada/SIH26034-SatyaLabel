import json

with open('frontend/public/manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

manifest['background_color'] = '#ffffff'
manifest['theme_color'] = '#ffffff'

with open('frontend/public/manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)
