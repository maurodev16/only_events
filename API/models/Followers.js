import mongoose from "mongoose";
import Establishment from "./Establishment.js";
import User from "./User.js";

const followersSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  establishment: { type: mongoose.Schema.Types.ObjectId, ref: 'Establishment' },

}, {
  timestamps: true,
}
);

const Followers = mongoose.model("Followers", followersSchema);

export default Followers;
