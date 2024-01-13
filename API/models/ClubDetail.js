import mongoose from "mongoose";
import dotenv from "dotenv";
import MusicCategory from "./MusicCategory.js";
import Establishment from "./Establishment.js";
dotenv.config();

const clubDetailSchema = new mongoose.Schema(
  {
    establishment_id:{type: mongoose.Schema.Types.ObjectId, ref: "Establishment", require: true, unique: true },
   // opening_hours: [openingHoursSchema],
    is_age_verified: { type: Boolean, default: false },
    selected_age: { type: String },
    is_free_entry: { type: Boolean, default: false },
    free_entry_till: { type: String },
    can_pay_with_card_entry: { type: Boolean, default: false },
    can_pay_with_card_consumption: { type: Boolean, default: false },
    music_category_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "MusicCategory" }],
    music_category_name: [{ type: String, default: [] }],

    //Detail
    drinks: { type: Boolean, default: false },
    dance: { type: Boolean, default: false },
    casual: { type: Boolean, default: false },
    good_to_go_with_group: { type: Boolean, default: false },

    //Services options
    dine_In: { type: Boolean, default: false },
    delivery: { type: Boolean, default: false },
    take_way: { type: Boolean, default: false },

    ///Acessibility
    accessible_parking: { type: Boolean, default: false },
    step_free_entry: { type: Boolean, default: false },
    accessible_restrooms: { type: Boolean, default: false },
    elevator_or_ramps: { type: Boolean, default: false },
    wide_corridors: { type: Boolean, default: false },
    braille_signage: { type: Boolean, default: false },
    mobility_assistance: { type: Boolean, default: false },
    service_dog_access: { type: Boolean, default: false },
    audio_description_or_visual_guide: { type: Boolean, default: false },
    accessible_communication: { type: Boolean, default: false },

    ///Convenience
    convenience_parking: { type: Boolean, default: false },
    wi_fi_access: { type: Boolean, default: false },
    outdoor_seating: { type: Boolean, default: false },
    indoor_seating: { type: Boolean, default: false },
    takeout_or_to_go_orders: { type: Boolean, default: false },
    delivery_service: { type: Boolean, default: false },
    reservation_service: { type: Boolean, default: false },
    drive_through: { type: Boolean, default: false },
    online_ordering: { type: Boolean, default: false },
    atm_access: { type: Boolean, default: false },

    ///Menu Options
    dining: { type: Boolean, default: false },
    alcoholic_beverages: { type: Boolean, default: false },
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
    dance_floor: { type: Boolean, default: false },
    casual_setting: { type: Boolean, default: false },
    formal_setting: { type: Boolean, default: false },
    live_music: { type: Boolean, default: false },
    karaoke: { type: Boolean, default: false },
    outdoor_seating_atmosphere: { type: Boolean, default: false },
    bar_area: { type: Boolean, default: false },
    good_for_groups: { type: Boolean, default: false },
    intimate_setting: { type: Boolean, default: false },
    family_friendly: { type: Boolean, default: false },
    lounge_area: { type: Boolean, default: false },

    ///Public type
    good_for_groups_public: { type: Boolean, default: false },
    family_friendly_public: { type: Boolean, default: false },
    kid_friendly: { type: Boolean, default: false },
    adults_only: { type: Boolean, default: false },
    solo_friendly: { type: Boolean, default: false },
    pet_friendly: { type: Boolean, default: false },
    lgbtq_plus_friendly: { type: Boolean, default: false },
    accessible_to_all: { type: Boolean, default: false },
    couples_retreat: { type: Boolean, default: false },
    student_friendly: { type: Boolean, default: false },

    ///Planning
    reservations_accepted: { type: Boolean, default: false },
    walk_ins_welcome: { type: Boolean, default: false },
    private_events: { type: Boolean, default: false },
    event_planning_services: { type: Boolean, default: false },
    catering_services: { type: Boolean, default: false },
    table_reservations: { type: Boolean, default: false },
    online_booking: { type: Boolean, default: false },
    event_space_rental: { type: Boolean, default: false },
    party_packages: { type: Boolean, default: false },
    custom_event_packages: { type: Boolean, default: false },

    //Payment Options
    credit_cards_accepted: { type: Boolean, default: false },
    debit_cards_accepted: { type: Boolean, default: false },
    cash_only: { type: Boolean, default: false },
    mobile_payments: { type: Boolean, default: false },
    contactless_payments: { type: Boolean, default: false },
    online_payments: { type: Boolean, default: false },
    checks: { type: Boolean, default: false },
    split_bills: { type: Boolean, default: false },
    gift_cards: { type: Boolean, default: false },
    crypto_currency: { type: Boolean, default: false },
    establishment_is_online: { type: Boolean, default: false },
    extra_info: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const ClubDetail = mongoose.model("ClubDetail", clubDetailSchema);

export default ClubDetail;
