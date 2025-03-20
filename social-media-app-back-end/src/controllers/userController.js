const User = require("../models/User");

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
