const Post = require("../models/Post");
const User = require("../models/User");

exports.search = async (req, res) => {
  try {
    const { query } = req.query;

    const users = await User.find({
      username: new RegExp(query, "i"),
    });
    const posts = await Post.find({
      content: new RegExp(query, "i"),
    }).populate("author", "username avatar");
    res.json({ users, posts });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
