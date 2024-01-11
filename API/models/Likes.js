import mongoose from "mongoose";
import User from "./User.js";
import Establishment from "./Establishment.js";

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  establishment: { type: mongoose.Schema.Types.ObjectId, ref: Establishment, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
},
);

const Like = mongoose.model('Like', likeSchema);

export default Like;
