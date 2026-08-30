const fs = require('fs');
let js = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

const targetUpload = `      const finalFile = await stitchImages(files);
      if (files.length > 1) toast.loading('Uploading merged image...', { id: toastId });

      const formData = new FormData();
      formData.append('image', finalFile);`;

const replaceUpload = `      const formData = new FormData();
      files.forEach(f => formData.append('images', f));`;

if (js.includes(targetUpload)) {
  js = js.replace(targetUpload, replaceUpload);
  fs.writeFileSync('frontend/app/upload/page.jsx', js);
  console.log("Fixed upload formData to send multiple images!");
} else {
  console.log("Could not find upload block.");
}
