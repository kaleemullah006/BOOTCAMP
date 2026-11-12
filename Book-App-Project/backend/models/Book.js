const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, default: "", trim: true },
    category: { type: String, default: "General", trim: true },
    language: { type: String, default: "Urdu", trim: true },
    fileUrl: { type: String, default: "" },
    filePath: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);