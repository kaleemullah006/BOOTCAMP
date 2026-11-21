const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");

const Product = require("../models/Product");
const adminOnly = require("../middleware/adminOnly");
const {
  createSignedUpload,
  publicUrl,
  deleteImages,
} = require("../utils/storage");

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------- HELPERS ---------- */

function pickFields(body) {
  const fields = {};

  const allowed = [
    "name",
    "description",
    "price",
    "discountPrice",
    "category",
    "sizeMl",
    "notes",
    "stock",
    "isFeatured",
    "isActive",
  ];

  allowed.forEach((key) => {
    if (body[key] !== undefined) {
      fields[key] = body[key];
    }
  });

  if (body.images !== undefined) {
    if (!Array.isArray(body.images)) {
      throw new Error("Images must be an array");
    }

    if (body.images.length > 5) {
      throw new Error("Maximum 5 images allowed");
    }

    const uniquePaths = new Set(body.images);

    if (uniquePaths.size !== body.images.length) {
      throw new Error("Duplicate image paths are not allowed");
    }

    fields.images = body.images.map((imagePath) => {
      if (
        typeof imagePath !== "string" ||
        !/^[a-f0-9-]{36}\.(jpg|png|webp)$/i.test(imagePath)
      ) {
        throw new Error("Invalid image storage path");
      }

      return {
        path: imagePath,
        url: publicUrl(imagePath),
      };
    });
  }

  if (fields.discountPrice === "" || fields.discountPrice === 0) {
    fields.discountPrice = null;
  }

  return fields;
}

function checkDiscount(data) {
  if (
    data.discountPrice != null &&
    data.price != null &&
    Number(data.discountPrice) >= Number(data.price)
  ) {
    return "Discount price must be less than price";
  }
  return null;
}

/* ---------- ADMIN ROUTES (pehle rakhe hain taake /:identifier se na takrayein) ---------- */

// GET /api/products/admin/all  (active + inactive sab)
router.get("/admin/all", adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/admin/:id  (edit form ke liye)
router.get("/admin/:id", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/upload-url  (signed upload token, image backend se pass nahi hoti)
router.post("/upload-url", adminOnly, async (req, res) => {
  try {
    const { filename, contentType, size } = req.body;

    const allowedTypes = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    if (!filename || !allowedTypes[contentType]) {
      return res.status(400).json({
        message: "Only JPG, PNG and WEBP images are allowed",
      });
    }

    if (!Number.isInteger(size) || size <= 0 || size > 2 * 1024 * 1024) {
      return res.status(400).json({
        message: "Image must be between 1 byte and 2 MB",
      });
    }

    const extension = path.extname(filename).toLowerCase();

    if (extension !== allowedTypes[contentType]) {
      return res.status(400).json({
        message: "File extension does not match image type",
      });
    }

    const imagePath = `${crypto.randomUUID()}${extension}`;

    const signedData = await createSignedUpload(imagePath);

    res.json({
      path: imagePath,
      token: signedData.token,
      signedUrl: signedData.signedUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products  (naya product)
router.post("/", adminOnly, async (req, res) => {
  try {
    const data = pickFields(req.body);
    const discountError = checkDiscount(data);
    if (discountError) return res.status(400).json({ message: discountError });

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id  (update)
router.put("/:id", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const data = pickFields(req.body);
    const discountError = checkDiscount({
      price: data.price ?? product.price,
      discountPrice:
        data.discountPrice !== undefined
          ? data.discountPrice
          : product.discountPrice,
    });
    if (discountError) return res.status(400).json({ message: discountError });

    // Jo purani images hata di gayi hain, unke paths pehle note kar lo
    let removedPaths = [];
    if (data.images) {
      const newPaths = new Set(data.images.map((img) => img.path));
      removedPaths = (product.images || [])
        .map((img) => img.path)
        .filter((p) => p && !newPaths.has(p));
    }

    product.set(data);
    await product.save(); // save() se slug hook chalta hai

    // Hataai gayi images Supabase se bhi delete karo (fail ho to request fail nahi hogi)
    if (removedPaths.length > 0) {
      try {
        await deleteImages(removedPaths);
      } catch (cleanupErr) {
        console.error("Old image cleanup failed:", cleanupErr);
      }
    }

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/products/:id/toggle  (Active <-> Hidden)
router.patch("/:id/toggle", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const imagePaths = (product.images || [])
      .map((image) => image.path)
      .filter(Boolean);

    // Pehle Supabase se images delete, phir MongoDB se product
    if (imagePaths.length > 0) {
      await deleteImages(imagePaths);
    }

    await product.deleteOne();

    res.json({ message: "Product and its images deleted successfully" });
  } catch (err) {
    console.error("Product deletion error:", err);
    res.status(500).json({ message: "Failed to delete product or its images" });
  }
});

/* ---------- PUBLIC ROUTES ---------- */

// GET /api/products?search=&category=&sort=&featured=true
router.get("/", async (req, res) => {
  try {
    const { search, category, sort, featured } = req.query;
    const filter = { isActive: true };

    if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const products = await Product.find(filter).sort(
      sortMap[sort] || sortMap.newest
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:identifier  (id ya slug, sirf active product)
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    const query = mongoose.isValidObjectId(identifier)
      ? { _id: identifier, isActive: true }
      : { slug: identifier, isActive: true };

    const product = await Product.findOne(query);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;