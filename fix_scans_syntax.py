import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    scans = f.read()

scans = scans.replace('console.log([Pipeline] Scan  was cancelled by user. Aborting pipeline.);', 'console.log(`[Pipeline] Scan ${scan.id} was cancelled by user. Aborting pipeline.`);')

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(scans)
