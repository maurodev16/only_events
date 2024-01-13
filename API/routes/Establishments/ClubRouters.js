import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment.js";
import cloudinary from "../../services/Cloudinary/cloudinary_config.js";
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import uploadSingleBanner from "../../middleware/multerSingleBannerMiddleware.js";
import ClubDetail from "../../models/ClubDetail.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
const router = Router();

router.post("/club-detail/:establishmentId", uploadSingleBanner.single("file"), async (req, res, next) => {
    try {
        const clubDetailsData = req.body;
        const establishmentId = req.params.establishmentId;

        // Verificar se o estabelecimento existe
        const establishmentObj = await Establishment.findById(establishmentId);
        if (!establishmentObj) {
            return res.status(422).json({ error: 'establishmentDoesNotExist' });
        }
        // Verificar se o tipo do estabelecimento é um Club
        if (establishmentObj.company_type !== 'club') {
            return res.status(422).json({ error: 'EstablishmentNotClubType' });
        }
        // Verificar se já existe um registro ClubDetail para o establishmentId
        const existingClubDetail = await ClubDetail.findOne({ establishment_id: establishmentId });
        if (existingClubDetail) {
            return res.status(422).json({ error: 'EstablishmentIdDetailAlreadyRegistered' });
        }

        // Criar um novo objeto BarDetail
        const clubDetail = new ClubDetail({
            establishment_id: establishmentId,
            // opening_hours: [openingHoursSchema],
            is_age_verified: clubDetailsData.is_age_verified,
            selected_age: clubDetailsData.selected_age,
            is_free_entry: clubDetailsData.is_free_entry,
            free_entry_till: clubDetailsData.free_entry_till,
            can_pay_with_card_entry: clubDetailsData.can_pay_with_card_entry,
            can_pay_with_card_consumption: clubDetailsData.can_pay_with_card_consumption,
            music_category_id: clubDetailsData.music_category_id,
            music_category_name: clubDetailsData.music_category_name,

            //Detail
            drinks: clubDetailsData.drinks,
            dance: clubDetailsData.dance,
            casual: clubDetailsData.casual,
            good_to_go_with_group: clubDetailsData.good_to_go_with_group,

            //Services options
            dine_In: clubDetailsData.dine_In,
            delivery: clubDetailsData.delivery,
            take_way: clubDetailsData.take_way,

            ///Acessibility
            accessible_parking: clubDetailsData.accessible_parking,
            step_free_entry: clubDetailsData.step_free_entry,
            accessible_restrooms: clubDetailsData.accessible_restrooms,
            elevator_or_ramps: clubDetailsData.elevator_or_ramps,
            wide_corridors: clubDetailsData.wide_corridors,
            braille_signage: clubDetailsData.braille_signage,
            mobility_assistance: clubDetailsData.mobility_assistance,
            service_dog_access: clubDetailsData.service_dog_access,
            audio_description_or_visual_guide: clubDetailsData.audio_description_or_visual_guide,
            accessible_communication: clubDetailsData.accessible_communication,

            ///Convenience
            convenience_parking: clubDetailsData.convenience_parking,
            wi_fi_access: clubDetailsData.wi_fi_access,
            outdoor_seating: clubDetailsData.outdoor_seating,
            indoor_seating: clubDetailsData.indoor_seating,
            takeout_or_to_go_orders: clubDetailsData.takeout_or_to_go_orders,
            delivery_service: clubDetailsData.delivery_service,
            reservation_service: clubDetailsData.reservation_service,
            drive_through: clubDetailsData.drive_through,
            online_ordering: clubDetailsData.online_ordering,
            atm_access: clubDetailsData.atm_access,

            // Menu Options
            dining: clubDetailsData.dining,
            alcoholic_beverages: clubDetailsData.alcoholic_beverages,
            shisha: clubDetailsData.shisha,
            wine_selection: clubDetailsData.wine_selection,
            beer_selection: clubDetailsData.beer_selection,
            cocktails: clubDetailsData.cocktails,
            non_alcoholic_beverages: clubDetailsData.non_alcoholic_beverages,
            coffee_and_tea: clubDetailsData.coffee_and_tea,
            desserts: clubDetailsData.desserts,
            vegetarian: clubDetailsData.vegetarian,
            vegan_options: clubDetailsData.vegan_options,

            // Atmosphere
            dance_floor: clubDetailsData.dance_floor,
            casual_setting: clubDetailsData.casual_setting,
            formal_setting: clubDetailsData.formal_setting,
            live_music: clubDetailsData.live_music,
            karaoke: clubDetailsData.karaoke,
            outdoor_seating_atmosphere: clubDetailsData.outdoor_seating_atmosphere,
            bar_area: clubDetailsData.bar_area,
            good_for_groups: clubDetailsData.good_for_groups,
            intimate_setting: clubDetailsData.intimate_setting,
            family_friendly: clubDetailsData.family_friendly,
            lounge_area: clubDetailsData.lounge_area,

            // Public type
            good_for_groups_public: clubDetailsData.good_for_groups_public,
            family_friendly_public: clubDetailsData.family_friendly_public,
            kid_friendly: clubDetailsData.kid_friendly,
            adults_only: clubDetailsData.adults_only,
            solo_friendly: clubDetailsData.solo_friendly,
            pet_friendly: clubDetailsData.pet_friendly,
            lgbtq_plus_friendly: clubDetailsData.lgbtq_plus_friendly,
            accessible_to_all: clubDetailsData.accessible_to_all,
            couples_retreat: clubDetailsData.couples_retreat,
            student_friendly: clubDetailsData.student_friendly,

            // Planning
            reservations_accepted: clubDetailsData.reservations_accepted,
            walk_ins_welcome: clubDetailsData.walk_ins_welcome,
            private_events: clubDetailsData.private_events,
            event_planning_services: clubDetailsData.event_planning_services,
            catering_services: clubDetailsData.catering_services,
            table_reservations: clubDetailsData.table_reservations,
            online_booking: clubDetailsData.online_booking,
            event_space_rental: clubDetailsData.event_space_rental,
            party_packages: clubDetailsData.party_packages,
            custom_event_packages: clubDetailsData.custom_event_packages,

            // Payment Options
            credit_cards_accepted: clubDetailsData.credit_cards_accepted,
            debit_cards_accepted: clubDetailsData.debit_cards_accepted,
            cash_only: clubDetailsData.cash_only,
            mobile_payments: clubDetailsData.mobile_payments,
            contactless_payments: clubDetailsData.contactless_payments,
            online_payments: clubDetailsData.online_payments,
            checks: clubDetailsData.checks,
            split_bills: clubDetailsData.split_bills,
            gift_cards: clubDetailsData.gift_cards,
            crypto_currency: clubDetailsData.crypto_currency,
            establishment_is_online: clubDetailsData.establishment_is_online,
            extra_info: clubDetailsData.extra_info,
        });

        // Salvar o objeto ClubDetail no banco de dados
        const savedClubDetail = await clubDetail.save();
        return res.status(201).json({ success: true, clubDetail: savedClubDetail });
    } catch (error) {
        console.error(`Error creating ClubDetail: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;