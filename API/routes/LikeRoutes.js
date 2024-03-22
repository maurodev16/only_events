import express from 'express';
import mongoose from 'mongoose';
import Like from '../models/Likes.js';
import Post from '../models/Posts.js';
import User from '../models/User.js';
import { Server } from 'socket.io';
import configureSocketServer from '../services/socketServer.js';
const router = express.Router();
const io = new Server(); // Criando uma instância do servidor Socket.IO
configureSocketServer();
// Rota para dar like e dislike em um post
router.post("/post/:postId/:userId", async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.params.userId;

        // Verifica se os IDs são válidos
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid user or post ID" });
        }

        // Verifica se o Post existe
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Verifica se o User existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verifica se o usuário já deu like neste Post
        const existingLike = await Like.findOne({ post: postId, user: userId });

        if (existingLike) {
            // Remove o like do schema Like
            await Like.findByIdAndDelete(existingLike._id);

            // Atualiza o array de likes e o contador no Post correspondente
            post.likes.pull(existingLike._id);
            post.likesCount--;
        } else {
            // Adiciona um novo like
            const newLike = new Like({ user: userId, post: postId });
            await newLike.save();

            // Atualiza o array de likes e o contador no Post correspondente
            post.likes.push(newLike._id);
            post.likesCount++;
        }

        await post.save();

        // Emitir evento de atualização de like/dislike para os clientes conectados
        io.emit('likeUpdate', { postId, likesCount: post.likesCount });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error performing like/dislike action:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
        });
    }
});

export default router;
