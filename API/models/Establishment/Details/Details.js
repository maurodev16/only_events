import mongoose from "mongoose";
import Follower from "../../Followers.js";
import dotenv from 'dotenv';
dotenv.config();
const detailsSchema = new mongoose.Schema({
    logoUrl: { type: String, default: "https://res.cloudinary.com/dhkyslgft/image/upload/v1704488249/logo_no_avaliable_fehssq.png" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follower", default: [] }],
    followersCount: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },

},
    {
        discriminatorKey: 'companyType', _id: false
    });


const Details = mongoose.model('Details', detailsSchema);

export default Details;
