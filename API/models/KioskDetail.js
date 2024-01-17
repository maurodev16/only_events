import mongoose from "mongoose";
import dotenv from "dotenv";
import MusicCategory from "./MusicCategory.js";
import Establishment from "./Establishment.js";
dotenv.config();

const kioskDetailSchema = new mongoose.Schema(
  {
    establishmentId:{type: mongoose.Schema.Types.ObjectId, ref: "Establishment", require: true, unique: true },
   // openingHours: [openingHoursSchema],
 
    //Services options
    delivery: { type: Boolean, default: false },

    ///Convenience
    indoorSeating: { type: Boolean, default: false },
    atmAccess: { type: Boolean, default: false },
    ///Menu Options
    electronicCigarette: { type: Boolean, default: false },
    shisha: { type: Boolean, default: false },
    wineSelection: { type: Boolean, default: false },
    beerSelection: { type: Boolean, default: false },
    cocktails: { type: Boolean, default: false },
    nonAlcoholicBeverages: { type: Boolean, default: false },
    coffeeAndTea: { type: Boolean, default: false },
    desserts: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    veganOptions: { type: Boolean, default: false },
    ///Atmosphere
    outdoorSeatingAtmosphere: { type: Boolean, default: false },
    barArea: { type: Boolean, default: false },
    //Payment Options
    creditCardsAccepted: { type: Boolean, default: false },
    debitCardsAccepted: { type: Boolean, default: false },
    cashOnly: { type: Boolean, default: false },
    mobilePayments: { type: Boolean, default: false },
    contactlessPayments: { type: Boolean, default: false },
    onlinePayments: { type: Boolean, default: false },
    establishmentIsOnline: { type: Boolean, default: false },
    extraInfo: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const KioskDetail = mongoose.model("KioskDetail", kioskDetailSchema);

export default KioskDetail;
