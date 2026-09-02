const fs = require('fs');
let code = fs.readFileSync('backend/routes/scans.js', 'utf8');

const oldFallback = `let cUrl = f.path; // fallback
            if (!uploadError && supabase.storage) {
              const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
              cUrl = data.publicUrl;
            }`;

const newFallback = `let cUrl;
            if (!uploadError && supabase && supabase.storage) {
              const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
              cUrl = data.publicUrl;
            } else {
              // HACKATHON FIX: If Supabase isn't configured, fall back to injecting a pure Base64 Data URI into the Postgres database.
              // This guarantees the image permanently survives Render's ephemeral free-tier disk wipes!
              cUrl = 'data:' + f.mimetype + ';base64,' + fileBuffer.toString('base64');
            }`;

if (code.includes('let cUrl = f.path; // fallback')) {
  code = code.replace(oldFallback, newFallback);
  fs.writeFileSync('backend/routes/scans.js', code);
  console.log("BASE64 STORAGE INJECTED");
} else {
  console.log("NOT FOUND");
}
