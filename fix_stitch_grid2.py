import re

with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

bad_stitch = """    // We want to pack images into a 2-column grid to avoid extreme horizontal aspect ratios
    // Extreme aspect ratios (like 3:1 or 4:1) cause Vision LLMs to downsample the text into illegible mush.
    const COLS = 2;
    const ROWS = Math.ceil(imgs.length / COLS);

    // Standardize all images to the same box size to make a clean grid
    const BOX_SIZE = 1200; // 1200px per box gives incredible detail without overloading the LLM
    
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

good_stitch = """    // Intelligently pack images to avoid extreme aspect ratios.
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

page = page.replace(bad_stitch, good_stitch)

with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated stitchImages to adapt COLS based on length")
