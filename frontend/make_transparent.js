const sharp = require('sharp');
sharp('public/emblem-cutout.jpg').ensureAlpha().raw().toBuffer({ resolveWithObject: true }).then(({ data, info }) => {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      if (r > 240 && g > 240 && b > 240) {
        const dist = ((255 - r) + (255 - g) + (255 - b)) / 3;
        let alpha = Math.min(255, Math.floor((dist / 15) * 255));
        if (dist < 5) alpha = 0;
        data[i+3] = alpha;
      }
    }
    return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile('public/emblem-transparent.png');
  }).then(() => console.log('TRANSPARENT PNG CREATED')).catch(err => console.error(err));
