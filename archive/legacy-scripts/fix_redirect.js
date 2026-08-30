const fs = require('fs');
let fe = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const targetStr = `            } else {
              setLoading(false);
            }`;

const replaceStr = `            } else if (data.status === 'complete' || data.status === 'completed') {
              if (data.scans && data.scans.length === 1) {
                router.push(\`/results/\${data.scans[0].id}\`);
              } else {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }`;

fe = fe.replace(targetStr, replaceStr);
fs.writeFileSync('frontend/app/batch/[id]/page.jsx', fe);
console.log("REDIRECT FIXED");
