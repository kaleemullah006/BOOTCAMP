
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const bucket = process.env.SUPABASE_BUCKET || "products";

// Generate public URL from storage path
function publicUrl(path) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// Generate signed upload URL
async function createSignedUpload(path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) throw error;

  return data;
}

// Delete multiple images from storage
async function deleteImages(paths) {
  if (!paths || paths.length === 0) return;

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) throw error;

  return data;
}

module.exports = {
  supabase,
  bucket,
  publicUrl,
  createSignedUpload,
  deleteImages,
};
