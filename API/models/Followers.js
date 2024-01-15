import mongoose from "mongoose";
import Establishment from "./Establishment.js";
import User from "./User.js";

const followerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  establishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' },

}, {
  timestamps: true,
}
);

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;
