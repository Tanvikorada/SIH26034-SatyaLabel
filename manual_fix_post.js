const fs = require('fs');
let js = fs.readFileSync('backend/routes/scans.js', 'utf8');

const startIdx = js.indexOf('// 1. Upload to Supabase Storage');
const endIdx = js.indexOf('} catch (err) {');

if (startIdx === -1 || endIdx === -1) {
    console.log("Could not find boundaries");
    process.exit(1);
}

const newBody = `// 1. Upload to Supabase Storage
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
        });
        batch.productNameHint = productNameHint;
        batch.brandNameHint   = brandNameHint;
        batch.sourceType      = sourceType;

        ok(res, { batch_id: batch.id, status: 'processing' }, 202);

        setImmediate(() => runBatchPipeline(batch, req.file.path, { forceEngine: req.body.forceEngine }));

      `;

// We have to be careful not to delete the catch block. 
// We are slicing from `// 1. Upload to Supabase Storage` down to the `} catch (err) {` line.
// But there might be multiple catch blocks. Let's find the specific one inside the route.
const sliceEndIdx = js.lastIndexOf('} catch (err) {', js.indexOf('// ─── GET /api/v1/scans/batch/:id'));
js = js.substring(0, startIdx) + newBody + js.substring(sliceEndIdx);

fs.writeFileSync('backend/routes/scans.js', js);
console.log("Rewritten fully.");
