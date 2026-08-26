import re

with open('frontend/app/results/[id]/page.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'''  useEffect\(\(\) => \{
    if \(!localStorage\.getItem\('token'\)\) return router\.push\('/login'\);
    const fetchScan = async \(\) => \{
      try \{
        const res = await fetch\(`\$\{API\}/scans/\$\{resolvedParams\.id\}`,\s*\{
          headers: \{\s*'Authorization': `Bearer \$\{localStorage\.getItem\('token'\)\}`\s*\}
        \}\);
        if \(!res\.ok\) throw new Error\("API Error"\);
        const json = await res\.json\(\);
        setReport\(json\.data \|\| json\);
      \} catch \{
        setReport\(\{
          id: resolvedParams\.id, status: 'completed', overallStatus: 'POTENTIAL NON-COMPLIANCE',
          compliance_score: 42, product: \{ product_name: 'Mock Product', brand_name: 'Mock Brand' \},
          extractedFields: \{ net_quantity: '100g', mrp: '50' \}, ocr_raw_text: "NET WT 100g MRP 50",
          violations: \[
            \{ rule_id: 'C02', detail_text: 'MRP not in standard format\.', severity: 'high', status: 'POTENTIAL NON-COMPLIANCE' \},
            \{ rule_id: 'C05', detail_text: 'Veg logo missing\.', severity: 'low', status: 'MANUAL REVIEW' \}
          \]
        \}\);
      \} finally \{ setLoading\(false\); \}
    \};
    fetchScan\(\);
  \}, \[resolvedParams\.id, router, API\]\);'''

replacement = '''  useEffect(() => {
    if (!localStorage.getItem('token')) return router.push('/login');
    let isMounted = true;
    let pollTimeout = null;

    const fetchScan = async () => {
      try {
        const res = await fetch(`${API}/scans/${resolvedParams.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error("API Error");
        const json = await res.json();
        const data = json.data || json;
        
        if (!isMounted) return;

        if (data.status === 'processing') {
          // Poll every 2.5 seconds if still processing
          pollTimeout = setTimeout(fetchScan, 2500);
        } else {
          setReport(data);
          setLoading(false);
        }
      } catch {
        if (!isMounted) return;
        setReport({
          id: resolvedParams.id, status: 'completed', overallStatus: 'POTENTIAL NON-COMPLIANCE',
          compliance_score: 42, product: { product_name: 'Mock Product', brand_name: 'Mock Brand' },
          extractedFields: { net_quantity: '100g', mrp: '50' }, ocr_raw_text: "NET WT 100g MRP 50",
          violations: [
            { rule_id: 'C02', detail_text: 'MRP not in standard format.', severity: 'high', status: 'POTENTIAL NON-COMPLIANCE' },
            { rule_id: 'C05', detail_text: 'Veg logo missing.', severity: 'low', status: 'MANUAL REVIEW' }
          ]
        });
        setLoading(false);
      }
    };
    fetchScan();

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [resolvedParams.id, router, API]);'''

if pattern in text:
    print("Found! Replacing...")
else:
    print("Did not find Exact string match, using regex search")
    # let's try regex search
    match = re.search(r"  useEffect\(\(\) => \{[\s\S]*?fetchScan\(\);\n  \}, \[resolvedParams\.id, router, API\]\);", text)
    if match:
        text = text[:match.start()] + replacement + text[match.end():]

with open('frontend/app/results/[id]/page.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
