const express = require("express");
const Book = require("../models/Book");
const supabase = require("../config/supabase");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();
const BUCKET = "books";

// GET /api/books?search=...&category=...  (sab ke liye)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (category) filter.category = category;

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      filter.$or = [{ title: rx }, { author: rx }];
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/categories  (sab ke liye): categories ki list
router.get("/categories", async (req, res) => {
  try {
    const categories = await Book.distinct("category");
    res.json(categories.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/books/upload-url  (sirf admin): upload ka parcha banao
router.post("/upload-url", adminOnly, async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ message: "fileName chahiye" });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(filePath);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ path: data.path, token: data.token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/books/:id/download  (sab ke liye): download ginti +1
router.post("/:id/download", async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/books  (sirf admin): book ka record save karo
router.post("/", adminOnly, async (req, res) => {
  try {
    const { title, author, category, language, filePath, fileSize } = req.body;

    let fileUrl = "";
    if (filePath) {
      fileUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data
        .publicUrl;
    }

    const book = await Book.create({
      title,
      author,
      category,
      language,
      filePath,
      fileSize,
      fileUrl,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/books/:id  (sirf admin)
router.patch("/:id", adminOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: "Book nahi mili" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/books/:id  (sirf admin): record bhi, file bhi
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (book && book.filePath) {
      await supabase.storage.from(BUCKET).remove([book.filePath]);
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;