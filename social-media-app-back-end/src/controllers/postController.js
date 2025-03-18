const Post = require("../models/Post");

// CREATE POST

exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user.userId;
    if (!content) return res.status(400).json({ error: "content required" });
    const post = new Post({ content, image, author: userId });
    await post.save();

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

// DELETE POST only with author name

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post unavailable" });
    if (post.author.toString() !== userId)
      return res.status(403).json({
        error: "not authorized",
      });
    await post.deleteOne();
    res.json({ message: "Post deleted with success! " });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

// LIKE POST or dislike

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post unavailable" });
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({
      message: alreadyLiked ? "like removed " : "post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

// get all posts

exports.getAllPosts = async (_req, res) => {
  try {
    const posts = await Post.find().populate("author", "username avatar").sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "server Error" });
  }
};
