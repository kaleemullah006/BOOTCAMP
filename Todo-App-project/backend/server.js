const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Har request par check karo ke database connected hai
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const todoRoutes = require("./routes/todoRoutes");
app.use("/api/todos", todoRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Sirf apne computer par server start karo (Vercel khud sambhalta hai)
if (require.main === module) {
  app.listen(process.env.PORT || 5000, () => {
    console.log("Server chal raha hai");
  });
}

module.exports = app;