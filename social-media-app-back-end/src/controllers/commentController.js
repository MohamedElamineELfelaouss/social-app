const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.addComment = async (req, res) => {
  try {
    // fetch data from req
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    // validation
    if (!text) return res.status(400).json({ error: "text field is required" });

    // add comment to specific Post
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "post unavailable" });

    /**
     * Creates a new Comment document with the provided text, author ID, and post ID.
     * The comment is then saved to the database.
     * - text: Content of the comment from request body
     * - author: User ID of the authenticated user making the comment
     * - post: ID of the post being commented on
     */

    const comment = new Comment({ text, author: userId, post: postId });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "server Error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commmentId } = req.params;
    const userId = req.user.userId;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "comment unavailable" });
    if (comment.author.toString() !== userId)
      return res.status(403).json({ error: "not authorized " });
    await comment.deleteOne();
    res.json({ message: "comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};
