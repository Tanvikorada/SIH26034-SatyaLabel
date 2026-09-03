const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { randomUUID } = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://omkjlsjazonebqiqvqlb.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta2psc2phem9uZWJxaXF2cWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDY0MjYsImV4cCI6MjEwMTQ4MjQyNn0.kKVFlQk8EF_XMqFRaglmaPYY-lvtILB6jq2Iqu02s5Y'
);

const BUCKET_NAME = 'satyalabel-uploads';

/**
 * Uploads an image buffer to Supabase Storage and returns the public URL.
 */
async function uploadImageToCloud(fileBuffer, originalName, mimetype) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(filename, fileBuffer, {
      contentType: mimetype,
      upsert: false
    });

  if (error) {
    console.error('[Storage] Supabase upload error:', error);
    throw new Error(`Cloud storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

module.exports = { uploadImageToCloud };
