import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const kioskSchema = new mongoose.Schema(
  {
    opening_hours: [openingHoursSchema],
    follower: [{ type: mongoose.Schema.Types.ObjectId, ref: "Follow" }],
    followers_count: { type: Number, default: 0 },
    is_featured: { type: Boolean },
    is_age_verified: { type: Boolean },
    selected_age: { type: String },
    is_free_entry: { type: Boolean },
    free_entry_till: { type: String },
    can_pay_with_card_entry: { type: Boolean },
    can_pay_with_card_consumption: { type: Boolean },
    music_category_id: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MusicCategory" },
    ],
    music_category_name: [{ type: String, default: [] }],

    //Detail
    drinks: { type: Boolean },
    dance: { type: Boolean },
    casual: { type: Boolean },
    good_to_go_with_group: { type: Boolean },

    //Services options
    dine_In: { type: Boolean },
    delivery: { type: Boolean },
    take_way: { type: Boolean },

    ///Acessibility
    accessible_parking: { type: Boolean },
    step_free_entry: { type: Boolean },
    accessible_restrooms: { type: Boolean },
    elevator_or_ramps: { type: Boolean },
    wide_corridors: { type: Boolean },
    braille_signage: { type: Boolean },
    mobility_assistance: { type: Boolean },
    service_dog_access: { type: Boolean },
    audio_description_or_visual_guide: { type: Boolean },
    accessible_communication: { type: Boolean },

    ///Convenience
    convenience_parking: { type: Boolean },
    wi_fi_access: { type: Boolean },
    outdoor_seating: { type: Boolean },
    indoor_seating: { type: Boolean },
    takeout_or_to_go_orders: { type: Boolean },
    delivery_service: { type: Boolean },
    reservation_service: { type: Boolean },
    drive_through: { type: Boolean },
    online_ordering: { type: Boolean },
    atm_access: { type: Boolean },

    ///Menu Options
    dining: { type: Boolean },
    alcoholic_beverages: { type: Boolean },
    shisha: { type: Boolean },
    wine_selection: { type: Boolean },
    beer_selection: { type: Boolean },
    cocktails: { type: Boolean },
    non_alcoholic_beverages: { type: Boolean },
    coffee_and_tea: { type: Boolean },
    desserts: { type: Boolean },
    vegetarian: { type: Boolean },
    vegan_options: { type: Boolean },

    ///Atmosphere
    dance_floor: { type: Boolean },
    casual_setting: { type: Boolean },
    formal_setting: { type: Boolean },
    live_music: { type: Boolean },
    karaoke: { type: Boolean },
    outdoor_seating_atmosphere: { type: Boolean },
    bar_area: { type: Boolean },
    good_for_groups: { type: Boolean },
    intimate_setting: { type: Boolean },
    family_friendly: { type: Boolean },
    lounge_area: { type: Boolean },

    ///Public type
    good_for_groups_public: { type: Boolean },
    family_friendly_public: { type: Boolean },
    kid_friendly: { type: Boolean },
    adults_only: { type: Boolean },
    solo_friendly: { type: Boolean },
    pet_friendly: { type: Boolean },
    lgbtq_plus_friendly: { type: Boolean },
    accessible_to_all: { type: Boolean },
    couples_retreat: { type: Boolean },
    student_friendly: { type: Boolean },

    ///Planning
    reservations_accepted: { type: Boolean },
    walk_ins_welcome: { type: Boolean },
    private_events: { type: Boolean },
    event_planning_services: { type: Boolean },
    catering_services: { type: Boolean },
    table_reservations: { type: Boolean },
    online_booking: { type: Boolean },
    event_space_rental: { type: Boolean },
    party_packages: { type: Boolean },
    custom_event_packages: { type: Boolean },

    //Payment Options
    credit_cards_accepted: { type: Boolean },
    debit_cards_accepted: { type: Boolean },
    cash_only: { type: Boolean },
    mobile_payments: { type: Boolean },
    contactless_payments: { type: Boolean },
    online_payments: { type: Boolean },
    checks: { type: Boolean },
    split_bills: { type: Boolean },
    gift_cards: { type: Boolean },
    crypto_currency: { type: Boolean },
    establishment_is_online: { type: Boolean, default: false },
    //start_date: { type: Date },
    //end_date: { type: Date },
    //start_time: { type: String, default: "" },
    //end_time: { type: String, default: "" },
    //week_days: [{ type: String, default: []}],
    //is_fixed_date: { type: Boolean },
    //extra_info: { type: String, default: "" },

  },
  {
    timestamps: true,
  }
);

const Kiosk = mongoose.model("Kiosk", kioskSchema);

export default Kiosk;
