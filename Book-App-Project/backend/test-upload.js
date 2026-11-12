require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const API = "http://localhost:5000/api";
const json = { "Content-Type": "application/json" };

async function main() {
  const file = process.argv[2];
  if (!file) return console.log("PDF ka path do");

  const fileName = path.basename(file);
  const buffer = fs.readFileSync(file);

  // 1. Admin login
  const login = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  }).then((r) => r.json());
  const auth = { ...json, Authorization: `Bearer ${login.token}` };

  // 2. Upload ka parcha
  const up = await fetch(`${API}/books/upload-url`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ fileName }),
  }).then((r) => r.json());
   console.log("Parcha jawab:", up);
  if (!up.path) return console.log("Parcha nahi mila, upar wala jawab dekho");

  // 3. File seedha Supabase par
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  const { error } = await supabase.storage
    .from("books")
    .uploadToSignedUrl(up.path, up.token, buffer, {
      contentType: "application/pdf",
    });
  if (error) return console.log("Upload error:", error.message);
  console.log("File upload ho gayi");

  // 4. Book ka record
  const book = await fetch(`${API}/books`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      title: fileName.replace(".pdf", ""),
      category: "Test",
      filePath: up.path,
      fileSize: buffer.length,
    }),
  }).then((r) => r.json());
  console.log("Book ban gayi:", book);
}

main();