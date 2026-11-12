const jwt = require("jsonwebtoken");

module.exports = function adminOnly(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Pehle login karo" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (data.role !== "admin") throw new Error("Not admin");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token galat ya expire ho gaya" });
  }
};