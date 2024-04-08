import mongoose from "mongoose";
import User  from "./User.js";

const tokenUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
});

const TokenUser = mongoose.model('TokenUser', tokenUserSchema);

export default TokenUser;
