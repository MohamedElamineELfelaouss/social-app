const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    if (userId === currentUserId)
      return res.status(400).json({ error: "You cant follow yourself" });
    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (!userToFollow || !currentUser)
      return res.status(404).json({ error: "User unavailable" });
    if (currentUser.following.includes(userId))
      return res.status(400).json({
        error: "You are already following this user",
      });
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);
    await currentUser.save();
    await userToFollow.save();
    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const userToUnfollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (!userToUnfollow || !currentUser)
      return res.status(404).json({ error: "User not found" });
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get followers of a user
exports.getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "followers",
      "username avatar"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get list of users followed by a user
exports.getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "following",
      "username avatar"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get user by id
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user by id
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { username, avatar },
      {
        new: true,
      }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const suggestedUsers = await User.find({
      _id: { $nin: [...user.following, req.user.userId] },
    }).limit(5);
    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    // Get current user and populate followers
    const user = await User.findById(req.user.userId).populate(
      "followers",
      "username avatar createdAt"
    );
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable" });

    // Get all posts created by user
    const myPosts = await Post.find({ author: user._id }).select(
      "_id content createdAt updatedAt"
    );
    const myPostIds = myPosts.map((p) => p._id);

    // Activity: Likes on my posts
    const postsWithLikes = await Post.find({
      author: user._id,
      likes: { $ne: [] },
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("likes", "username avatar")
      .populate("author", "username avatar");

    const likeActivities = postsWithLikes.flatMap((post) =>
      // Exclude self-likes
      post.likes
        .filter((likeUser) => likeUser._id.toString() !== user._id.toString())
        .map((likeUser) => ({
          _id: `${post._id}-${likeUser._id}`,
          type: "like",
          author: likeUser,
          post: { content: post.content },
          createdAt: post.updatedAt,
        }))
    );

    // Activity: Comments on my posts
    const comments = await Comment.find({
      post: { $in: myPostIds },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "username avatar")
      .populate("post", "content");

    const commentActivities = comments
      .filter(
        (comment) => comment.author._id.toString() !== user._id.toString()
      )
      .map((comment) => ({
        _id: comment._id,
        type: "comment",
        author: comment.author,
        post: { content: comment.post.content },
        createdAt: comment.createdAt,
      }));

    //Activity: New followers (people who followed me)
    // we may need to adjust the schema for follow events to get accurate timestamps.
    const followActivities = user.followers.map((follower) => ({
      _id: `${user._id}-${follower._id}`,
      type: "follow",
      author: follower,
      createdAt: user.createdAt, //fetching data from the user object
    }));

    // Activity: Mentions (posts that tag me with @username)
    const mentions = await Post.find({
      content: new RegExp(`@${user.username}`, "i"),
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "username avatar");

    const mentionActivities = mentions.map((post) => ({
      _id: post._id,
      type: "mention",
      author: post.author,
      post: { content: post.content },
      createdAt: post.createdAt,
    }));

    // Combine and sort all activities by date (newest first)
    const activities = [
      ...likeActivities,
      ...commentActivities,
      ...followActivities,
      ...mentionActivities,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
