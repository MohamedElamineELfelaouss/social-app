// ENVIRONMENT AND PACKAGE IMPORTS
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// EXPRESS APP INITIALIZATION
const app = express();
const PORT = process.env.PORT || 5000;

// DATABASE CONNECTION
// Import database connection function
const { connectDB } = require("./src/config/db");
// Initialize database connection
connectDB();

// ROUTE IMPORTS
const authRoutes = require("./src/routes/authRoutes");
const postRoutes = require("./src/routes/postRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const userRoutes = require("./src/routes/userRoutes.js");
const searchRoutes = require("./src/routes/searchRoutes.js");

// MIDDLEWARE CONFIGURATION
// Parse JSON requests with increased size limit for media uploads to not exceed 50MB (not recommended as best practice)
// This is a temporary solution to avoid issues with large media uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Enable Cross-Origin
app.use(cors());
app.use(helmet());
// logs HTTP requests to the console
app.use(morgan("dev"));

// ROUTE SETUP
// Authentication routes
app.use("/api/auth", authRoutes);
// Posts routes
app.use("/api/posts", postRoutes);
// Comments routes
app.use("/api/comments", commentRoutes);
// Users routes
app.use("/api/users", userRoutes);
// Searchs routes
app.use("/api/search", searchRoutes);

// ROOT ROUTE
// This route is used to check if the server is running and can be accessed
app.get("/", (req, res) => {
  res.send("Welcome to the Social Media API!");
});

// SERVER INITIALIZATION
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
