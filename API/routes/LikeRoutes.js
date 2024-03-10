import { Router } from 'express';
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
      const existingLike = await Like.findOne({ postObjId: postId, userObjId: userId });

      if (existingLike) {
        // Remove o like do schema Like
        await Like.findByIdAndDelete(existingLike._id);

        // Atualiza o array de likes e o contador no Post correspondente
        post.likeObjIds.pull(existingLike._id);
        post.likesCount--;
        await post.save();

        // Emitir evento de like/dislike para os clientes conectados
        io.emit('likeUpdate', { action: 'remove', like: existingLike });

        return res.status(200).json({
          isLiked: false,
          postObjId: postId,
          userObjId: userId,
        });

      } else {
        // Adiciona um novo like
        const newLike = new Like({ userObjId: userId, postObjId: postId });
        await newLike.save();

        // Atualiza o array de likes e o contador no Post correspondente
        post.likeObjIds.push(newLike._id);
        post.likesCount++;
        await post.save();

        // Emitir evento de like/dislike para os clientes conectados
        io.emit('likeUpdate', { action: 'add', like: newLike });

        return res.status(200).json({
          isLiked: true,
          _id: newLike._id,
          postObjId: postId,
          userObjId: userId,
          createdAt: newLike.createdAt,
          updatedAt: newLike.updatedAt,
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
  return router;
}

export default likeRouter;
