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

        // Emitir evento de like/dislike para os clientes conectados
        io.on('connection', (socket) => {
          socket.emit('likeUpdate', existingLike);
          socket.on('removed Like', async () => {
            // Atualiza o array de likes e o contador no Post correspondente
            post.likeObjIds.pull(existingLike._id);
            post.likesCount--;
            socket.emit('likeUpdate', existingLike);
            socket.broadcast.emit('likeUpdate', existingLike);

            await post.save();
          });
        });

        return res.status(200).json({
          success: true,
          message: "Disliked",
          userId: userId,
        });

      } else {
        // Adiciona um novo like
        const newLike = new Like({ userObjId: userId, postObjId: postId });
        await newLike.save();
        console.log(newLike)



        // Emitir evento de like/dislike para os clientes conectados
        io.on('connection', (socket) => {
          socket.emit('likeUpdate', existingLike);
          socket.on('new Liked', async () => {
            // Atualiza o array de likes e o contador no Post correspondente
            post.likeObjIds.push(newLike._id);
            post.likesCount++;
            socket.emit('likeUpdate', existingLike);
            socket.broadcast.emit('likeUpdate', existingLike);
            await post.save();
          });
        });


        return res.status(200).json({
          success: true,
          message: "Liked",
          userId: userId,
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
