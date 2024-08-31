import { Router } from "express";
import mongoose from "mongoose";
import Post from "../../models/PostModel/Posts.js";
import User from "../../models/UserModel/User.js";
import Favorite from "../../models/FavoriteModel/Favorite.js";
import checkToken from "../../middleware/checkToken.js";

const favoriteRouter = (io) => {
    const router = Router();

    router.post("/post/:postId/:userId", async (req, res) => {
        try {
            const postId = req.params.postId;
            const userId = req.params.userId;

            // Check if ID is valid
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ error: "Invalid user ID" });
            }

            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).json({ error: "Invalid post ID" });
            }

            // Check if Post exists
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            // Check if User exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Check if the user has already favorited this post
            const existingFavorite = await Favorite.findOne({ post: postId, user: userId });

            if (existingFavorite) {
                // Remove the existing favorite
                await Favorite.findByIdAndDelete(existingFavorite._id);

                // Update the favorites array and counter on the corresponding Post
                post.favorites.pull(existingFavorite._id);
                post.favoritesCount--;
                await post.save();

                // Emit an event to notify about the unfavoriting
                io.emit('favoriteUpdated', { postId, userId, isFavorited: false });

                console.log(`Post ${postId} removed from favorites by user ${userId}`);
                
                return res.status(200).json({
                    message: "Post removed from favorites",
                    isFavorited: false,
                });
            } else {
                // Add a new favorite
                const newFavorite = new Favorite({
                    user: userId,
                    post: postId,
                    isFavorited: true,
                });
                await newFavorite.save();

                // Update the favorites array and counter on the corresponding Post
                post.favorites.push(newFavorite._id);
                post.favoritesCount++;
                await post.save();

                // Emit an event to notify about the favoriting
                io.emit('favoriteUpdated', { postId, userId, isFavorited: true });
                console.log(`Post ${postId} added to favorites by user ${userId}`);
                

                return res.status(200).json({
                    message: "Post added to favorites",
                    isFavorited: true,
                });
            }
        } catch (error) {
            console.error("Error performing favorite/unfavorite action:", error);
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
            const favoritedPostIds = favorites.map((favorite) => favorite.post);

            // Encontre os favoritados correspondentes aos IDs
            const favoritedPosts = await Post.find({ _id: { $in: favoritedPostIds } })
                .select("-__v")
                .select("-favorites")
                .select("-postStatus")
                .select("-companyObjId");

            return res.status(200).json({
                favoritedPosts: favoritedPosts,
            });
        } catch (error) {
            console.error("Error fetching favorited Posts:", error);
            return res
                .status(500)
                .json({ error: "An error occurred while processing the request" });
        }
    });

   
    return router;
};

export default favoriteRouter;
