import mongoose from "mongoose";
import Establishment from "./Establishment/Establishment.js";

const tokenEstbSchema = new mongoose.Schema({
    establishmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Establishment", required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
});

const TokenEstab = mongoose.model('TokenEstab', tokenEstbSchema);

export default TokenEstab;
