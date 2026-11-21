const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    category: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Gift Set"],
      required: true,
    },
    sizeMl: { type: Number, required: true, min: 1 },
    notes: {
      top: { type: String, default: "" },
      heart: { type: String, default: "" },
      base: { type: String, default: "" },
    },
    images: [
      {
        url: { type: String, required: true },
        path: { type: String, required: true },
        _id: false,
      },
    ],
    stock: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate a unique slug from the name
productSchema.pre("validate", async function () {
  if (!this.isModified("name") && this.slug) return;

  const base = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = base;
  let count = 1;
  while (await mongoose.models.Product.exists({ slug, _id: { $ne: this._id } })) {
    count += 1;
    slug = `${base}-${count}`;
  }
  this.slug = slug;
});

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);