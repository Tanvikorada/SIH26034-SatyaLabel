const fs = require('fs');
let js = fs.readFileSync('frontend/app/upload/page.jsx', 'utf8');

// 1. Allow multiple files in state
js = js.replace(/const \[file, setFile\] = useState\(null\);/, `const [files, setFiles] = useState([]);`);

// 2. Update handleDrop and handleFile
const targetHandleFile = `  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };`;
const replaceHandleFile = `  const handleFile = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(f => f.type.startsWith('image/')).slice(0, 4);
    if (validFiles.length > 0) {
      setFiles(validFiles);
      setPreviewUrl(URL.createObjectURL(validFiles[0]));
    }
  };`;
js = js.replace(targetHandleFile, replaceHandleFile);

// Change occurrences of e.target.files[0] to e.target.files
js = js.replace(/handleFile\(e\.dataTransfer\.files\[0\]\);/g, `handleFile(e.dataTransfer.files);`);
js = js.replace(/handleFile\(e\.target\.files\[0\]\);/g, `handleFile(e.target.files);`);

// 3. Update formData append
const targetFormData = `      formData.append('image', file);`;
const replaceFormData = `      files.forEach(f => formData.append('images', f));`;
js = js.replace(targetFormData, replaceFormData);

// 4. Update file validation
js = js.replace(/if \(!file\)/g, `if (files.length === 0)`);
js = js.replace(/onClick=\{\(\) => setFile\(null\)\}/g, `onClick={() => { setFiles([]); setPreviewUrl(null); }}`);
js = js.replace(/<span className="truncate max-w-\[200px\]">\{file.name\}<\/span>/g, `<span className="truncate max-w-[200px]">{files.length} image{files.length > 1 ? 's' : ''} selected</span>`);

// 5. Update input multiple
js = js.replace(/<input type="file" className="hidden" accept="image\/\*" onChange=\{/, `<input type="file" multiple className="hidden" accept="image/*" onChange={`);

fs.writeFileSync('frontend/app/upload/page.jsx', js);
console.log("Updated Upload UI!");
