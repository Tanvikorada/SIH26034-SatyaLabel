const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const regex = /\/\/ 1\. Upload to Supabase Storage[\s\S]*?status:\s*'processing',\s*\}\);/g;

const replacement = `// 1. Upload to Supabase Storage (Multi-Image Support)
          const cloudUrls = [];
          for (const f of req.files) {
            const fileBuffer = require('fs').readFileSync(f.path);
            const fileName = \`\${Date.now()}_\${require('path').basename(f.originalname)}\`;
            
            const { data: uploadData, error: uploadError } = await supabase
              .storage
              .from('uploads')
              .upload(fileName, fileBuffer, {
                contentType: f.mimetype,
                upsert: true
              });
    
            let cUrl = f.path; // fallback
            if (!uploadError && supabase.storage) {
              const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
              cUrl = data.publicUrl;
            }
            cloudUrls.push(cUrl);
          }
  
          const { Batch } = require('../models');
          const batch = await Batch.create({
            originalImage: JSON.stringify(cloudUrls),
            uploadedBy: req.user?.id || null,
            status: 'processing',
          });`;

if (regex.test(js)) {
  js = js.replace(regex, replacement);
  fs.writeFileSync('backend/routes/scans.js', js);
  console.log("Supabase fix applied!");
} else {
  console.log("Could not find Supabase block via regex!");
}
