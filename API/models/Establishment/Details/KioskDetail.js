import mongoose from "mongoose";
import Details from "./Details.js";
import dotenv from "dotenv";
dotenv.config();

const kioskDetailSchema = new mongoose.Schema(
  {
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
  });

const KioskDetail = Details.discriminator("kiosk", kioskDetailSchema);


export default KioskDetail;
