import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../UserModel/User.js";
dotenv.config();

const promoterDetailSchema = new mongoose.Schema({
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  extraInfo: { type: String, default: "" },
  contactInfo: { type: String, default: "" },
  musicGenre: { type: String, default: "" },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const PromoterDetail = mongoose.model("Promoter", promoterDetailSchema);

export default PromoterDetail;
