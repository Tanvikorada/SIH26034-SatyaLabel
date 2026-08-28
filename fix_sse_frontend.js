const fs = require('fs');
let js = fs.readFileSync('frontend/app/batch/[id]/page.jsx', 'utf8');

const s1 = `        if (data.status === 'processing') {
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
    
    return () => clearTimeout(intervalId);
  }, [resolvedParams, router]);`;

const r1 = `        if (data.status === 'processing') {
          // Instead of polling, use SSE for real-time push!
          const eventSource = new EventSource(\`\${API}/scans/batch/\${resolvedParams.id}/stream?token=\${localStorage.getItem('token')}\`);
          
          eventSource.onmessage = (event) => {
            const streamData = JSON.parse(event.data);
            if (streamData.status === 'completed' || streamData.status === 'failed') {
              eventSource.close();
              fetchBatch(); // Fetch final state once push notification received
            }
          };

          eventSource.onerror = () => {
            eventSource.close();
            // Fallback to slow polling if SSE drops (e.g. strict corporate proxy)
            intervalId = setTimeout(fetchBatch, 4000);
          };

          // Store eventSource in intervalId ref to clean it up on unmount
          intervalId = eventSource;
        } else {
          setLoading(false);
        }
      } catch(err) {
        setLoading(false);
        toast.error('Failed to load scan batch');
      }
    };
    
    fetchBatch();
    
    return () => {
      if (intervalId instanceof EventSource) intervalId.close();
      else clearTimeout(intervalId);
    };
  }, [resolvedParams, router]);`;

js = js.replace(s1, r1);
fs.writeFileSync('frontend/app/batch/[id]/page.jsx', js);
console.log("SSE frontend injected");
