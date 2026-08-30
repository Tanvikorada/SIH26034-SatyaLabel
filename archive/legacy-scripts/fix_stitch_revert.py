import re

with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

bad_stitch = """    // Intelligently pack images to avoid extreme aspect ratios.
    // Extreme aspect ratios (like 3:1 horizontal) cause Vision LLMs to squish the image into illegible mush.
    let COLS = 1;
    if (imgs.length > 1) COLS = 2;
    const ROWS = Math.ceil(imgs.length / COLS);

    const BOX_SIZE = 1200; // 1200px per box gives incredible detail
    
    const finalWidth = COLS * BOX_SIZE;
    const finalHeight = ROWS * BOX_SIZE;

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalWidth, finalHeight);

    imgs.forEach((img, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      
      const targetX = col * BOX_SIZE;
      const targetY = row * BOX_SIZE;
      
      // Calculate scaling to fit the image inside the BOX_SIZE while maintaining aspect ratio
      const scale = Math.min(BOX_SIZE / img.width, BOX_SIZE / img.height);
      const drawWidth = Math.floor(img.width * scale);
      const drawHeight = Math.floor(img.height * scale);
      
      // Center it in the box
      const offsetX = targetX + (BOX_SIZE - drawWidth) / 2;
      const offsetY = targetY + (BOX_SIZE - drawHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    });"""

good_stitch = """    // Calculate original sizes
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

page = page.replace(bad_stitch, good_stitch)

with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Reverted stitchImages to horizontal strip")
