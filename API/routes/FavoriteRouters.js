import { Router } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Posts.js';
import User from '../models/User.js';
import Favorite from '../models/Favorite.js';
import checkToken from '../middleware/checkToken.js';

const router = Router();

// Route to Create Favorite and disFavorite on a post
router.post("/post/:postId/:userId", async (req, res) => {//checkToken, 
    try {
        const postId = req.params.postId;
        const userId = req.params.userId;
        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }
        // Check if Post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "post not found" });
        }
        // Check if User exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user has already favorited this post
        const existingFavorite = await Favorite.findOne({ post: postId, user: userId });

        if (existingFavorite) {
            // Remove the existingFavorite from the Favorite schema
            await Favorite.findByIdAndDelete(existingFavorite._id);

            // Update the favorites array and counter on the corresponding Post
            post.favorites.pull(existingFavorite._id);
            post.favoritesCount--;
            await post.save();
            
            // Emit favorite/disfavorite event to connected clients
            io.emit('likeFavorite', { action: 'remove', favorite: existingFavorite });
            return res.status(200).json({ isFavorited: false });
        } else {
            // Add a new favorite
            const newfavorite = new Favorite({ user: userId, post: postId, isFavorited: true });
            await newfavorite.save();
            // Update the newfavorite array and counter on the corresponding Post
            post.favorites.push(newfavorite._id);
            post.favoritesCount++;

            await post.save();

            // Emit favorite/disfavorite event to connected clients
            io.emit('favoriteUpdate', { action: 'add', favorite: newfavorite });
            return res.status(200).json({ favorited: newfavorite });
        }
    } catch (error) {
        console.error("Error performing favorite/Unfavorited action:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
        });
    }
});


// Rota para buscar a lista de Favoritos por usuário
router.get("/fetch-favorite-posts-by-user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        // Verifique se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        // Verifique se o User existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Encontre os posts favoritados para o usuário corrente
        const favorites = await Favorite.find({ user: userId });

        // Extraia os IDs dos posts favoritados
        const favoritedPostIds = favorites.map(favorite => favorite.post);

        // Encontre os favoritados correspondentes aos IDs
        const favoritedPosts = await Post.find({ _id: { $in: favoritedPostIds } })
            .select("-__v")
            .select("-favorites")
            .select("-postStatus")
            .select("-establishmentObjId");
        return res.status(200).json({
            favoritedPosts: favoritedPosts,
        });
    } catch (error) {
        console.error("Error fetching favorited Posts:", error);
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }
});


// Rota para obter os estabelecimentos seguidos por um usuário
router.get("/:userId/follow-estab", checkToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        // Verifique se o User existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Encontre os registros de seguidores para o usuário
        const favorites = await Favorite.find({ user: userId });

        // Extraia os IDs dos posts favoritados
        const favoritedPostIds = favorites.map(favorites => favorites.post);

        // Encontre os favoritados correspondentes aos IDs
        const favoritedPosts = await Favorite.find({ _id: { $in: favoritedPostIds } });

        return res.status(200).json({
            success: true,
            favoritedPosts: favoritedPosts,
        });
    } catch (error) {
        console.error("Error fetching favorited Posts:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
        });
    }
});


export default router;
