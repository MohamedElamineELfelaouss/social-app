const express = require("express");

const { authenticate } = require("../middleware/authMiddleware");

const {
  createPost,
  deletePost,
  likePost,
  getAllPosts,
  getUserPosts,
  getFeed,
  getTrendingTopics,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/trending/topics", getTrendingTopics);
router.get("/feed", authenticate, getFeed);
router.post("/", authenticate, createPost);
router.delete("/:postId", authenticate, deletePost);
router.put("/:postId/like", authenticate, likePost);
router.get("/user/:userId/", authenticate, getUserPosts);

module.exports = router;
