import mongoose from "mongoose";
import User from "../UserModel/User.js";

const followerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  isFollowed: {type:Boolean, default: false},
  createdAt: { type: Date, default: Date.now }
});

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;
