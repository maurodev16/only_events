import mongoose from "mongoose";
import User from "../UserModel/User.js";
import Post from "../PostModel/Posts.js";

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  isLiked: {type:Boolean},
  createdAt: { type: Date, default: Date.now }
});

const Like = mongoose.model('Like', likeSchema);

export default Like;
