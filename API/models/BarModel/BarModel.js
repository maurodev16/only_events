import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../UserModel/User.js";
dotenv.config();

const barDetailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isAgeVerified: { type: Boolean, default: false },
    selectedAge: { type: String },
    isFreeEntry: { type: Boolean, default: false },
    freeEntryTill: { type: String },
    canPayWithCardEntry: { type: Boolean, default: false },
    canPayWithCardConsumption: { type: Boolean, default: false },
    musicCategoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "MusicCategory" }],
    musicCategoryName: [{ type: String, default: [] }],

    //Detail
    drinks: { type: Boolean, default: false },
    dance: { type: Boolean, default: false },
    casual: { type: Boolean, default: false },
    goodToGoWithGroup: { type: Boolean, default: false },

    //Services options
    dineIn: { type: Boolean, default: false },
    delivery: { type: Boolean, default: false },
    takeWay: { type: Boolean, default: false },

    ///Acessibility
    accessibleParking: { type: Boolean, default: false },
    stepFreeEntry: { type: Boolean, default: false },
    accessibleRestrooms: { type: Boolean, default: false },
    elevatorOrRamps: { type: Boolean, default: false },
    wideCorridors: { type: Boolean, default: false },
    brailleSignage: { type: Boolean, default: false },
    mobilityAssistance: { type: Boolean, default: false },
    serviceDogAccess: { type: Boolean, default: false },
    audioDescriptionOrVisualGuide: { type: Boolean, default: false },
    accessibleCommunication: { type: Boolean, default: false },

    ///Convenience
    convenienceParking: { type: Boolean, default: false },
    wiFiAccess: { type: Boolean, default: false },
    outdoorSeating: { type: Boolean, default: false },
    indoorSeating: { type: Boolean, default: false },
    takeoutOrToGoOrders: { type: Boolean, default: false },
    deliveryService: { type: Boolean, default: false },
    reservationService: { type: Boolean, default: false },
    driveThrough: { type: Boolean, default: false },
    onlineOrdering: { type: Boolean, default: false },
    atmAccess: { type: Boolean, default: false },

    ///Menu Options
    dining: { type: Boolean, default: false },
    alcoholicBeverages: { type: Boolean, default: false },
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
    danceFloor: { type: Boolean, default: false },
    casualSetting: { type: Boolean, default: false },
    formalSetting: { type: Boolean, default: false },
    liveMusic: { type: Boolean, default: false },
    karaoke: { type: Boolean, default: false },
    outdoorSeatingAtmosphere: { type: Boolean, default: false },
    barArea: { type: Boolean, default: false },
    goodForGroups: { type: Boolean, default: false },
    intimateSetting: { type: Boolean, default: false },
    familyFriendly: { type: Boolean, default: false },
    loungeArea: { type: Boolean, default: false },

    ///Public type
    goodForGroupsPublic: { type: Boolean, default: false },
    familyFriendlyPublic: { type: Boolean, default: false },
    kidFriendly: { type: Boolean, default: false },
    adultsOnly: { type: Boolean, default: false },
    soloFriendly: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    lgbtqPlusFriendly: { type: Boolean, default: false },
    accessibleToAll: { type: Boolean, default: false },
    couplesRetreat: { type: Boolean, default: false },
    studentFriendly: { type: Boolean, default: false },

    ///Planning
    reservationsAccepted: { type: Boolean, default: false },
    walkInsWelcome: { type: Boolean, default: false },
    privateEvents: { type: Boolean, default: false },
    eventPlanningServices: { type: Boolean, default: false },
    cateringServices: { type: Boolean, default: false },
    tableReservations: { type: Boolean, default: false },
    onlineBooking: { type: Boolean, default: false },
    eventSpaceRental: { type: Boolean, default: false },
    partyPackages: { type: Boolean, default: false },
    customEventPackages: { type: Boolean, default: false },

    //Payment Options
    creditCardsAccepted: { type: Boolean, default: false },
    debitCardsAccepted: { type: Boolean, default: false },
    cashOnly: { type: Boolean, default: false },
    mobilePayments: { type: Boolean, default: false },
    contactlessPayments: { type: Boolean, default: false },
    onlinePayments: { type: Boolean, default: false },
    checks: { type: Boolean, default: false },
    splitBills: { type: Boolean, default: false },
    giftCards: { type: Boolean, default: false },
    cryptoCurrency: { type: Boolean, default: false },
    extraInfo: { type: String, default: "" },
  });

const BarDetail = mongoose.model("bar", barDetailSchema);
export default BarDetail;
