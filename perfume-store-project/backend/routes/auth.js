const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { password } = req.body || {};

  if (!password || !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

// GET /api/auth/verify (frontend isse token check karega)
router.get("/verify", adminOnly, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;