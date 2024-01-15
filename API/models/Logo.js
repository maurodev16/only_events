import mongoose from "mongoose";
import User from './User.js';
const logoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true }, 
  logo_url: { type: String },

});

const Logo = mongoose.model('Logo', logoSchema);

export default Logo;