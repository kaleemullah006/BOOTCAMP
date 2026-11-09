const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const noteRoutes = require("./routes/noteRoutes");
app.use("/api/notes", noteRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log("Server chal raha hai, port", process.env.PORT);
    });
  })
  .catch((err) => console.log("Error:", err.message));