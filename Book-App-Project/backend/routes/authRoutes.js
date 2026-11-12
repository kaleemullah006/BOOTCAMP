const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Galat password" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

module.exports = router;