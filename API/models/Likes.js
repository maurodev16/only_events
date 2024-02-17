import mongoose from "mongoose";
import User from "./User.js";
import Post from "./Posts.js";

const likeSchema = new mongoose.Schema({
  userObjId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postObjId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
},
  {
    timestamps: true,
  });

const Like = mongoose.model('Like', likeSchema);

export default Like;
