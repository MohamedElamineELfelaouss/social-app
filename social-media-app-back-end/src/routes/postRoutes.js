const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");

const {
  createPost,
  deletePost,
  likePost,
  getAllPosts,
} = require("../controllers/postController");

const router = express.Router();

router.post("/", authenticate, createPost);
router.delete("/:postId", authenticate, deletePost);
router.put("/:postId/like", authenticate, likePost);
router.get("/", getAllPosts);

module.exports = router;
