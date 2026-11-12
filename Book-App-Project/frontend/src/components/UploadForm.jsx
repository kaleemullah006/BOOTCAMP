import { useState } from "react";
import { getUploadUrl, createBook } from "../api";
import { supabase } from "../supabase";

const MAX_MB = 50;
const emptyForm = { title: "", author: "", category: "General", language: "Urdu" };

export default function UploadForm({ onUploaded }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const setField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pickFile = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    // Title khali ho to file ke naam se bhar do
    if (f && !form.title) {
      setForm({ ...form, title: f.name.replace(/\.pdf$/i, "") });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.target;
    setMsg({ type: "", text: "" });

    if (!file) return setMsg({ type: "error", text: "Pehle PDF file chuno" });
    if (file.type !== "application/pdf")
      return setMsg({ type: "error", text: "Sirf PDF file allowed hai" });
    if (file.size > MAX_MB * 1024 * 1024)
      return setMsg({ type: "error", text: `File ${MAX_MB} MB se chhoti honi chahiye` });
    if (!form.title.trim())
      return setMsg({ type: "error", text: "Book ka title likho" });

    setBusy(true);
    try {
      // 1. Backend se upload ka parcha
      const up = await getUploadUrl(file.name);

      // 2. File seedha Supabase par
      const { error } = await supabase.storage
        .from("books")
        .uploadToSignedUrl(up.path, up.token, file, {
          contentType: "application/pdf",
        });
      if (error) throw new Error(error.message);

      // 3. Book ka record save
      await createBook({ ...form, filePath: up.path, fileSize: file.size });

      setForm(emptyForm);
      setFile(null);
      formEl.reset();
      setMsg({ type: "success", text: "Book upload ho gayi ✅" });
      onUploaded();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="adm-card adm-form" onSubmit={handleSubmit}>
      <h2>📤 Nayi Book Upload Karo</h2>

      <input
        className="adm-input adm-file"
        type="file"
        accept="application/pdf"
        onChange={pickFile}
      />

      <input
        className="adm-input"
        name="title"
        placeholder="Book ka title *"
        value={form.title}
        onChange={setField}
      />

      <input
        className="adm-input"
        name="author"
        placeholder="Musannif / Author"
        value={form.author}
        onChange={setField}
      />

      <div className="adm-row">
        <div>
          <input
            className="adm-input"
            name="category"
            list="categories"
            placeholder="Category"
            value={form.category}
            onChange={setField}
          />
          <datalist id="categories">
            <option value="General" />
            <option value="Islamic" />
            <option value="Poetry" />
            <option value="History" />
            <option value="Education" />
            <option value="Novel" />
          </datalist>
        </div>

        <select
          className="adm-input"
          name="language"
          value={form.language}
          onChange={setField}
        >
          <option>Urdu</option>
          <option>English</option>
          <option>Arabic</option>
          <option>Pashto</option>
          <option>Other</option>
        </select>
      </div>

      {msg.text && (
        <div className={`adm-msg ${msg.type === "error" ? "adm-error" : "adm-success"}`}>
          {msg.text}
        </div>
      )}

      <button className="adm-btn adm-primary" disabled={busy}>
        {busy ? "Upload ho rahi hai..." : "Upload Book"}
      </button>
    </form>
  );
}