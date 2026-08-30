import re

with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

old_form_data = """      const formData = new FormData();
      formData.append('image', file);
      formData.append('metadata', JSON.stringify(metadata));"""

new_form_data = """      const formData = new FormData();
      formData.append('image', file);
      formData.append('product_name', productName || '');
      formData.append('source_type', sourceType || 'physical_label');
      formData.append('metadata', JSON.stringify(metadata));"""

page = page.replace(old_form_data, new_form_data)

with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated upload form data")
