import mongoose from "mongoose";
import Establishment from "./Establishment/Establishment.js";
import User from "./User.js";

const followerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  establishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' },
  isFollowed: {type:Boolean, default: false},
}, {
  timestamps: true,
}
);

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;
