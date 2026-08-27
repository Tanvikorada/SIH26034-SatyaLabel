import re

with open('frontend/app/globals.css', 'r', encoding='utf-8') as f:
    css = f.read()

old_body = """@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
  }"""

new_body = """@layer base {
  html, body {
    width: 100%;
    min-height: 100dvh; /* Dynamic viewport height fixes mobile bottom bar */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    overscroll-behavior-y: none; /* Prevents rubber-banding on mobile */
  }"""

css = css.replace(old_body, new_body)

# Also override .min-h-screen utility since it's used across the app
if ".min-h-screen {" not in css:
    css += "\n\n@layer utilities {\n  .min-h-screen {\n    min-height: 100dvh !important;\n  }\n}\n"

with open('frontend/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated globals.css for PWA")
