import re

with open("frontend/app/upload/page.jsx", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace("router.push(`/results/${json.data.scan_id}`);", "router.push(`/batch/${json.data.batch_id}`);")

with open("frontend/app/upload/page.jsx", "w", encoding="utf-8") as f:
    f.write(js)
print("Upload route fixed")
