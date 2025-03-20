const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");

const {
  createPost,
  deletePost,
  likePost,
  getAllPosts,
  getUserPosts,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", getAllPosts);
router.post("/", authenticate, createPost);
router.delete("/:postId", authenticate, deletePost);
router.put("/:postId/like", authenticate, likePost);
router.get("/user/:userId/", authenticate, getUserPosts);

module.exports = router;
