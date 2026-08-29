const fs = require('fs');
const glob = require('glob');

const files = glob.sync('frontend/app/batch/*/page.jsx');
if (files.length === 0) {
  console.log("No batch page found!");
  process.exit(1);
}

const file = files[0];
let js = fs.readFileSync(file, 'utf8');

const target = `      let intervalId;
      
      const fetchBatch = async () => {
        try {
          const res = await fetch(\`\${API}/scans/batch/\${resolvedParams.id}\`, {
            headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
          });
          if (!res.ok) throw new Error('Failed to fetch batch');
          const json = await res.json();
          const data = json.data || json;
          
          setBatch(data);
          
          if (data.status === 'processing') {
            intervalId = setTimeout(fetchBatch, 2000);
          } else {
            setLoading(false);
            
          }
        } catch(err) {
          setLoading(false);
          toast.error('Failed to load scan batch');
        }
      };

      fetchBatch();
      
      return () => clearTimeout(intervalId);`;

const replace = `      // Fetch initial state
      const fetchBatch = async () => {
        try {
          const res = await fetch(\`\${API}/scans/batch/\${resolvedParams.id}\`, {
            headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` }
          });
          if (!res.ok) throw new Error('Failed to fetch batch');
          const json = await res.json();
          const data = json.data || json;
          
          setBatch(data);
          
          if (data.status === 'processing') {
            // Setup real-time SSE stream for updates instead of polling
            const token = localStorage.getItem('token');
            const eventSource = new EventSource(\`\${API}/scans/batch/\${resolvedParams.id}/stream?token=\${token}\`);
            
            eventSource.onmessage = (event) => {
              const streamData = JSON.parse(event.data);
              if (streamData.status !== 'processing') {
                eventSource.close();
                fetchBatch(); // Re-fetch to get the final complete data
              }
            };

            eventSource.onerror = () => {
              eventSource.close();
              // Fallback to polling if SSE fails
              setTimeout(fetchBatch, 3000);
            };

            return () => eventSource.close();
          } else {
            setLoading(false);
          }
        } catch(err) {
          setLoading(false);
          toast.error('Failed to load scan batch');
        }
      };

      fetchBatch();`;

if (js.includes(target)) {
  js = js.replace(target, replace);
  fs.writeFileSync(file, js);
  console.log("Successfully wired up real-time WebSockets (SSE)!");
} else {
  console.log("Target string not found in batch page!");
}
