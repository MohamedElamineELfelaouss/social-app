const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const {
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
  getRecentActivity,
} = require("../controllers/userController");

const router = express.Router();

router.get("/suggestions", authenticate, getSuggestedUsers);
router.get("/activity", authenticate, getRecentActivity);
router.get("/:userId", getUser);
router.put("/:userId", authenticate, updateUser);
router.put("/:userId/follow", authenticate, followUser);
router.put("/:userId/unfollow", authenticate, unfollowUser);
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/following", getUserFollowing);

module.exports = router;
