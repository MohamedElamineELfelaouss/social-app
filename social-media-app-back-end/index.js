require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// import routes
const authRoutes = require("./src/routes/authRoutes");
const postRoutes = require("./src/routes/postRoutes");
const commentRoutes = require("./src/routes/commentRoutes");

const PORT = process.env.PORT || 5000;
const app = express();

// importing DB CONNECTION FROM CONFIG FILE
const { connectDB } = require("./src/config/db");
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

app.listen(PORT, () => console.log(`server is running under port ${PORT}`));
