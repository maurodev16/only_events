const router = require("express").Router();
const Like = require("../models/Likes");
const Post = require("../models/Post");
const checkToken = require("../middleware/checkToken");

// Rota para dar um like e Dislike a um post
router.post("/:postId", checkToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.auth._id;

    // Verifica se o post existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Verifica se o usuário deu like a este post
    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (existingLike) {
      // Remove o like do schema Like
      await Like.findByIdAndDelete(existingLike._id);

      // Atualiza o array de likes e o contador no post correspondente
      post.likes.pull(existingLike._id);
      post.likes_count--;

      await post.save();

      return res.status(200).json({
        is_success: true,
        message: "Disliked",
      });
    } else {
      // Adiciona um novo like
      const newLike = new Like({ user: userId, post: postId });
      await newLike.save();

      // Atualiza o array de likes e o contador no post correspondente
      post.likes.push(newLike._id);
      post.likes_count++;

      await post.save();

      return res.status(200).json({
        is_success: true,
        message: "Liked",
      });
    }
  } catch (error) {
    console.error("Error performing like/dislike action:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
});

module.exports = router;
