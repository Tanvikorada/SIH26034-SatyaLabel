import re

with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Replace state
old_state = """  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);"""
new_state = """  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);"""
page = page.replace(old_state, new_state)

# Replace handleFile
old_handleFile = """  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };"""

new_handleFile = """  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    if (selected && files.length < 3) {
      setFiles(prev => [...prev, selected]);
      setPreviews(prev => [...prev, URL.createObjectURL(selected)]);
    }
    // reset input so the same file can be selected again if needed
    e.target.value = null;
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const stitchImages = async (imageFiles) => {
    if (imageFiles.length === 0) return null;
    if (imageFiles.length === 1) return imageFiles[0];
    
    const loadImg = (f) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(f);
    });

    const imgs = await Promise.all(imageFiles.map(loadImg));
    
    const totalWidth = imgs.reduce((sum, img) => sum + img.width, 0);
    const maxHeight = Math.max(...imgs.map(img => img.height));

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, maxHeight);

    let currentX = 0;
    imgs.forEach(img => {
      ctx.drawImage(img, currentX, 0, img.width, img.height);
      currentX += img.width;
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob], "stitched_label.jpg", { type: "image/jpeg" }));
      }, 'image/jpeg', 0.9);
    });
  };"""
page = page.replace(old_handleFile, new_handleFile)

# Replace handleUpload logic
old_upload = """  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('No image selected');
    
    setLoading(true);
    const toastId = toast.loading('Initializing compliance scan...');
    const metadata = { productName: productName || 'Unknown', category, sourceType, forceEngine: 'gemini', timestamp: new Date().toISOString() };
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('product_name', productName || '');
      formData.append('source_type', sourceType || 'physical_label');
      formData.append('metadata', JSON.stringify(metadata));"""

new_upload = """  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error('No image selected');
    
    setLoading(true);
    const toastId = toast.loading(files.length > 1 ? 'Stitching panorama...' : 'Initializing compliance scan...');
    const metadata = { productName: productName || 'Unknown', category, sourceType, forceEngine: 'gemini', timestamp: new Date().toISOString() };
    
    try {
      const finalFile = await stitchImages(files);
      if (files.length > 1) toast.loading('Uploading merged image...', { id: toastId });

      const formData = new FormData();
      formData.append('image', finalFile);
      formData.append('product_name', productName || '');
      formData.append('source_type', sourceType || 'physical_label');
      formData.append('metadata', JSON.stringify(metadata));"""
page = page.replace(old_upload, new_upload)

# Replace the saveToSyncQueue fallback error
page = page.replace("await saveToSyncQueue(file, metadata);", "await saveToSyncQueue(files[0], metadata);")


# Now replace the UI Dropzone
old_ui = """              <div className="relative w-full h-[240px] border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-surface overflow-hidden group hover:border-mist transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="flex flex-col items-center gap-4 relative z-10 w-full">
                     <span className="text-[14px] text-text-secondary font-medium mb-2">Upload a Product Label</span>
                     <div className="flex gap-4 w-full justify-center px-4">
                       
                       {/* Camera Button */}
                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Take Photo</span>
                         <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                       {/* Gallery Button */}
                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Gallery</span>
                         <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                     </div>
                  </div>
                )}
              </div>"""

new_ui = """              <div className="relative w-full min-h-[240px] p-4 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-surface group hover:border-mist transition-colors">
                {previews.length > 0 ? (
                  <div className="w-full flex flex-col gap-4">
                    <div className="text-[13px] text-text-secondary text-center">
                      Added {previews.length} of 3 photos. Images will be automatically stitched together.
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-[100px] h-[140px] border border-border rounded-lg overflow-hidden group/img shadow-sm">
                          <img src={src} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 hover:scale-110">
                            ✕
                          </button>
                        </div>
                      ))}
                      
                      {previews.length < 3 && (
                        <div className="flex flex-col gap-3 w-[100px] h-[140px]">
                          <div className="relative h-1/2 rounded-lg border border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mb-1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            <span className="text-[10px] font-medium text-text-secondary">+ Camera</span>
                            <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                          <div className="relative h-1/2 rounded-lg border border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mb-1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span className="text-[10px] font-medium text-text-secondary">+ Gallery</span>
                            <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 relative z-10 w-full py-8">
                     <span className="text-[14px] text-text-secondary font-medium mb-2">Take photos of the front, side, and back of the label.</span>
                     <div className="flex gap-4 w-full justify-center px-4">
                       
                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Take Photo</span>
                         <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                       <div className="relative overflow-hidden mello-btn-secondary !bg-surface !border-border !px-4 !py-3 flex flex-col items-center gap-2 hover:!border-primary cursor-pointer w-[140px] shadow-sm">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         <span className="text-[12px] font-medium text-text-primary">Gallery</span>
                         <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                       </div>

                     </div>
                  </div>
                )}
              </div>"""

page = page.replace(old_ui, new_ui)

with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated to multi-image collage upload")
