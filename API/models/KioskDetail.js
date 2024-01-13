import mongoose from "mongoose";
import dotenv from "dotenv";
import MusicCategory from "./MusicCategory.js";
import Establishment from "./Establishment.js";
dotenv.config();

const kioskDetailSchema = new mongoose.Schema(
  {
    establishment_id:{type: mongoose.Schema.Types.ObjectId, ref: "Establishment", require: true, unique: true },
   // opening_hours: [openingHoursSchema],
 
    //Services options
    delivery: { type: Boolean, default: false },

    ///Convenience
    indoor_seating: { type: Boolean, default: false },
    atm_access: { type: Boolean, default: false },

    ///Menu Options
    electronic_cigarette: { type: Boolean, default: false },
    shisha: { type: Boolean, default: false },
    wine_selection: { type: Boolean, default: false },
    beer_selection: { type: Boolean, default: false },
    cocktails: { type: Boolean, default: false },
    non_alcoholic_beverages: { type: Boolean, default: false },
    coffee_and_tea: { type: Boolean, default: false },
    desserts: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    vegan_options: { type: Boolean, default: false },
    ///Atmosphere
   
    outdoor_seating_atmosphere: { type: Boolean, default: false },
    bar_area: { type: Boolean, default: false },

    //Payment Options
    credit_cards_accepted: { type: Boolean, default: false },
    debit_cards_accepted: { type: Boolean, default: false },
    cash_only: { type: Boolean, default: false },
    mobile_payments: { type: Boolean, default: false },
    contactless_payments: { type: Boolean, default: false },
    online_payments: { type: Boolean, default: false },
    establishment_is_online: { type: Boolean, default: false },
    extra_info: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const KioskDetail = mongoose.model("KioskDetail", kioskDetailSchema);

export default KioskDetail;
