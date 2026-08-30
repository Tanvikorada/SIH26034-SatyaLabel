with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

bad_stitch = """    // Calculate original sizes
    const origTotalWidth = imgs.reduce((sum, img) => sum + img.width, 0);
    const origMaxHeight = Math.max(...imgs.map(img => img.height));

    // Calculate scaling factor to prevent massive files (max 1500px height)
    const MAX_HEIGHT = 1500;
    const scale = origMaxHeight > MAX_HEIGHT ? MAX_HEIGHT / origMaxHeight : 1;
    
    const finalWidth = Math.floor(origTotalWidth * scale);
    const finalHeight = Math.floor(origMaxHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalWidth, finalHeight);

    let currentX = 0;
    imgs.forEach(img => {
      const drawWidth = Math.floor(img.width * scale);
      const drawHeight = Math.floor(img.height * scale);
      ctx.drawImage(img, currentX, 0, drawWidth, drawHeight);
      currentX += drawWidth;
    });"""

smart_grid = """    // Smart dynamic grid packing to prevent extreme aspect ratios without letterboxing
    const num = imgs.length;
    let cols = num > 2 ? 2 : num; // Max 2 columns
    let rows = Math.ceil(num / cols);

    // Find max width and max height among all images to create uniform grid cells
    let maxCellWidth = 0;
    let maxCellHeight = 0;
    imgs.forEach(img => {
      if (img.width > maxCellWidth) maxCellWidth = img.width;
      if (img.height > maxCellHeight) maxCellHeight = img.height;
    });

    // Scale cells if they are insanely huge (to prevent canvas crash)
    const MAX_CELL_DIM = 1200;
    const scale = Math.min(1, MAX_CELL_DIM / maxCellWidth, MAX_CELL_DIM / maxCellHeight);
    
    const cellW = Math.floor(maxCellWidth * scale);
    const cellH = Math.floor(maxCellHeight * scale);

    const finalWidth = cols * cellW;
    const finalHeight = rows * cellH;

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalWidth, finalHeight);

    imgs.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const drawWidth = Math.floor(img.width * scale);
      const drawHeight = Math.floor(img.height * scale);
      
      // Center the image within its grid cell without letterboxing the actual drawing
      const x = (col * cellW) + Math.floor((cellW - drawWidth) / 2);
      const y = (row * cellH) + Math.floor((cellH - drawHeight) / 2);
      
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    });"""

page = page.replace(bad_stitch, smart_grid)

with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated to Smart Grid Packing")
