import { Router } from 'express';
import mongoose from 'mongoose';
import Like from '../models/Likes.js';
import Post from '../models/Posts.js';
import User from '../models/User.js';
import checkToken from '../middleware/checkToken.js';

const router = Router();

const likeRouter = (io) => {
  // Rota para dar like e dislike em um post
  router.post("/post/:postId/:userId", async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.params.userId;
      // Verifique se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Verifique se o ID é válido
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      // Verifica se o Post existe
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }
      // Verifica se o User existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Verifica se o usuário já deu like neste Post
      const existingLike = await Like.findOne({user: userId , post: postId });

      if (existingLike) {
        // Remove o like do schema Like
        await Like.findByIdAndDelete(existingLike._id);

        // Atualiza o array de likes e o contador no Post correspondente
        post.likes.pull(existingLike._id);
        post.likesCount--;
        await post.save();

        // Emitir evento de like/dislike para os clientes conectados
        io.emit('likeUpdate', { action: 'remove', like: existingLike });
        return res.status(200).json({  isLiked: false });
      } else {
        // Adiciona um novo like
        const newLike = new Like({  user: userId, post: postId, isLiked: true });
        await newLike.save();
        // Atualiza o array de likes e o contador no Post correspondente
        post.likes.push(newLike._id);
        post.likesCount++;
        await post.save();

        // Emitir evento de like/dislike para os clientes conectados
        io.emit('likeUpdate', { action: 'add', like: newLike });

        return res.status(200).json({ liked: newLike });
      }
    } catch (error) {
      console.error("Error performing like/dislike action:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while processing the request",
      });
    }
  });

  return router;
}

export default likeRouter;
