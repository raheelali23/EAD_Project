const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");

dotenv.config();
connectDB();

const app = express();

// Debug middleware
app.use((req, res, next) => {
  // console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

// 404 handler
app.use((req, res, next) => {
  // console.log('404 Not Found:', req.originalUrl);
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // console.log('Available routes:');
  // console.log('- DELETE /api/courses/:id');
  // console.log('- POST /api/courses/:id/materials');
});
