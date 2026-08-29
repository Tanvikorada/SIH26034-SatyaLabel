const fs = require('fs');
let fe = fs.readFileSync('frontend/app/results/[id]/page.jsx', 'utf8');

const regex = /<div className="flex justify-between items-start border-b border-border pb-8 mb-8">/g;

const replace = `          <div className="mb-10 p-6 bg-surface/30 border border-border rounded-2xl">
            <h3 className="text-sm font-bold tracking-widest uppercase text-text-muted mb-4">Photographic Evidence</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {(() => {
                let images = [];
                try {
                  const imgStr = report.original_image || report.originalImage || report.image_url;
                  images = JSON.parse(imgStr);
                  if (!Array.isArray(images)) images = [imgStr];
                } catch (e) {
                  images = [report.original_image || report.originalImage || report.image_url].filter(Boolean);
                }
                if (images.length === 0) return <div className="text-[13px] text-text-secondary">No evidence attached.</div>;
                return images.map((img, idx) => (
                  <img key={idx} src={img.startsWith('http') ? img : (process.env.NEXT_PUBLIC_API_URL || 'https://satyalabel-backend.onrender.com/api/v1').replace('/api/v1', '') + '/' + img} alt="Evidence" className="h-48 rounded-xl object-contain bg-black/20 border border-border/50 shadow-md" />
                ));
              })()}
            </div>
          </div>
          <div className="flex justify-between items-start border-b border-border pb-8 mb-8">`;

if(fe.match(regex)) {
  fe = fe.replace(regex, replace);
  fs.writeFileSync('frontend/app/results/[id]/page.jsx', fe);
  console.log("UI IMAGE FIXED");
} else {
  console.log("REGEX FAILED");
}
