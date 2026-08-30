import re

with open('backend/routes/scans.js', 'r', encoding='utf-8') as f:
    routes = f.read()

abort_check = '''
      // Check if cancelled before proceeding
      await scan.reload();
      if (scan.status === 'failed' && scan.errorMessage === 'Scan cancelled by user.') {
        console.log([Pipeline] Scan  was cancelled by user. Aborting pipeline.);
        return;
      }
'''

# Insert abort check after OCR
routes = routes.replace('// Step 2: Extract fields', abort_check + '\n      // Step 2: Extract fields')

with open('backend/routes/scans.js', 'w', encoding='utf-8') as f:
    f.write(routes)
