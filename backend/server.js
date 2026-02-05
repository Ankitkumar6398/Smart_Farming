const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
<<<<<<< Updated upstream
app.get('/', (req, res) => {
  res.json({ message: 'Kishan Mitra API is running!' });
=======
app.get("/", (req, res) => {
  res.json({ message: "Smart Farming API is running!" });
>>>>>>> Stashed changes
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// User routes
app.use("/api/user", require("./routes/user"));

// Market routes
app.use("/api/market", require("./routes/market"));

// Weather routes
app.use("/api/weather", require("./routes/weather"));

// Community routes
app.use("/api/community", require("./routes/community"));

// Crop health AI routes
app.use("/api/crop-health", require("./routes/cropHealth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
