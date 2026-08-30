with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("".join(lines[150:350]))
