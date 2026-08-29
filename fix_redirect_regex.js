const fs = require('fs');
let fe = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const regex = /\} else \{\s*setLoading\(false\);\s*\}/;

const replaceStr = `} else if (data.status === 'complete' || data.status === 'completed') {
              if (data.scans && data.scans.length === 1) {
                router.push(\`/results/\${data.scans[0].id}\`);
              } else {
                setLoading(false);
              }
            } else {
              setLoading(false);
            }`;

if (fe.match(regex)) {
  fe = fe.replace(regex, replaceStr);
  fs.writeFileSync('frontend/app/batch/[id]/page.jsx', fe);
  console.log("REDIRECT FIXED");
} else {
  console.log("NOT FOUND");
}
