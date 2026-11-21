const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.disable("x-powered-by");

/* ---------- CORS ---------- */

// CLIENT_URL mein ek ya zyada URL (comma se alag), maslan:
// https://af-perfumes.vercel.app,https://www.afperfumes.com
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const openCors = allowedOrigins.length === 0;

if (openCors) {
  console.warn("CLIENT_URL is not set: CORS is open to all origins");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman, server-to-server ya same-origin requests
      if (!origin) return callback(null, true);
      if (openCors) return callback(null, true);
      if (origin === "http://localhost:5173") return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);

app.use(express.json({ limit: "100kb" }));

/* ---------- HEALTH (DB se pehle, taake hamesha jawab de) ---------- */

app.get("/", (req, res) => {
  res.json({ ok: true, message: "AF Perfumes API" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "AF Perfumes API is running" });
});


/* ---------- MongoDB (serverless friendly) ---------- */

let connecting = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  // Ek saath aane wali requests ek hi connection ka intezar karti hain
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then(() => console.log("MongoDB connected"))
      .finally(() => {
        connecting = null;
      });
  }

  await connecting;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

/* ---------- ROUTES ---------- */

require("./models/Product");
require("./models/Order");

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));

/* ---------- 404 aur errors ---------- */

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  console.error("Server error:", err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}