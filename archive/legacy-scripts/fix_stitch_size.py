import re

with open('frontend/app/upload/page.jsx', 'r', encoding='utf-8') as f:
    page = f.read()

old_stitch = """    const totalWidth = imgs.reduce((sum, img) => sum + img.width, 0);
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
    });"""

new_stitch = """    // Calculate original sizes
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

page = page.replace(old_stitch, new_stitch)

# Let's also compress the JPEG to 0.7 instead of 0.9
page = page.replace("'image/jpeg', 0.9", "'image/jpeg', 0.7")

# Wait, if they upload a SINGLE image, it doesn't run through the stitcher at all!
# "if (imageFiles.length === 1) return imageFiles[0];"
# If they upload a SINGLE 10MB image, it might also crash!
# Let's force even single images through the scale-down logic!
page = page.replace("if (imageFiles.length === 1) return imageFiles[0];", "")


with open('frontend/app/upload/page.jsx', 'w', encoding='utf-8') as f:
    f.write(page)
print("Updated stitchImages to scale down massive camera photos")
