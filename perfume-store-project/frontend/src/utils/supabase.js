import { createClient } from "@supabase/supabase-js";

// Sirf anon key frontend mein. Service key kabhi nahi.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const BUCKET = "products";