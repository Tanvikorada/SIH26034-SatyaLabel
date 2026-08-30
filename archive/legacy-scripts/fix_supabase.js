const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const targetSupabase = `        try {
          // 1. Upload to Supabase Storage
          const fileBuffer = fs.readFileSync(req.file.path);
          const fileName = \`\${Date.now()}_\${path.basename(req.file.originalname)}\`;
          
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, fileBuffer, {
              contentType: req.file.mimetype,
              upsert: true
            });
  
          let cloudUrl = req.file.path; // fallback
          if (!uploadError) {
            const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
            cloudUrl = data.publicUrl;
          }
  
          const { Batch } = require('../models');
          const batch = await Batch.create({
            originalImage:    cloudUrl,
            uploadedBy:       req.user?.id || null,
            status:           'processing',
          });`;

const replaceSupabase = `        try {
          // 1. Upload to Supabase Storage (Multi-Image Support)
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
            if (!uploadError) {
              const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
              cUrl = data.publicUrl;
            }
            cloudUrls.push(cUrl);
          }
  
          const { Batch } = require('../models');
          const batch = await Batch.create({
            originalImage:    JSON.stringify(cloudUrls),
            uploadedBy:       req.user?.id || null,
            status:           'processing',
          });`;

// Remove the `const cloudUrl = JSON.stringify(filePaths);` from my earlier hack!
js = js.replace(/const cloudUrl = JSON\.stringify\(filePaths\);/, '');

if (js.includes(targetSupabase.replace(/\r\n/g, '\n'))) {
  js = js.replace(targetSupabase.replace(/\r\n/g, '\n'), replaceSupabase);
} else {
  js = js.replace(targetSupabase, replaceSupabase);
}

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Fixed Supabase multi-image upload!");
