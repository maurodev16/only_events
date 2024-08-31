import mongoose from "mongoose";
import Details from "./Details.js";
import dotenv from "dotenv";
dotenv.config();

const promoterDetailSchema = new mongoose.Schema(
  {
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    extraInfo: { type: String, default: '' },
    contactInfo: { type: String, default: '' },
    musicGenre: { type: String, default: '' },
  });

const PromoterDetail = mongoose.model("Promoter", promoterDetailSchema);


export default PromoterDetail;
