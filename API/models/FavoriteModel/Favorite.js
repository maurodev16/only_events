import mongoose from "mongoose";
import Post from "../PostModel/Posts.js";
import User from "../UserModel/User.js";


const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  isFavorited: {type:Boolean},
  createdAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
