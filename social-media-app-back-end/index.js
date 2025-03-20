require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 5000;
// importing DB CONNECTION FROM CONFIG FILE
const { connectDB } = require("./src/config/db");

// import routes
const authRoutes = require("./src/routes/authRoutes");
const postRoutes = require("./src/routes/postRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const userRoutes = require("./src/routes/userRoutes.js");

// connecting to db
connectDB();

// increase request body size limit
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

// auth
app.use("/api/auth", authRoutes);

// posts
app.use("/api/posts", postRoutes);
//comments
app.use("/api/comments", commentRoutes);
// user
app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`server is running under port ${PORT}`));
