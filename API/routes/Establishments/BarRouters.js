import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment.js";
import cloudinary from "../../services/Cloudinary/cloudinary_config.js";
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import uploadSingleBanner from "../../middleware/multerSingleBannerMiddleware.js";
import BarDetail from "../../models/BarDetail.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
const router = Router();

router.post("/bar-detail/:establishmentId", uploadSingleBanner.single("file"), async (req, res, next) => {
    try {
        const bardDetailsData = req.body;
        const establishmentId = req.params.establishmentId;

        // Verificar se o estabelecimento existe
        const establishmentObj = await Establishment.findById(establishmentId);
        if (!establishmentObj) {
            return res.status(422).json({ error: 'establishmentDoesNotExist' });
        }
        // Verificar se o tipo do estabelecimento é um bar
        if (establishmentObj.company_type !== 'bar') {
            return res.status(422).json({ error: 'EstablishmentNotBarType' });
        }
        // Verificar se já existe um registro BarDetail para o establishmentId
        const existingBarDetail = await BarDetail.findOne({ establishment_id: establishmentId });
        if (existingBarDetail) {
            return res.status(422).json({ error: 'EstablishmentIdDetailAlreadyRegistered' });
        }


        // Criar um novo objeto BarDetail
        const barDetail = new BarDetail({
            establishment_id: establishmentId,
            // opening_hours: [openingHoursSchema],
            is_age_verified: bardDetailsData.is_age_verified,
            selected_age: bardDetailsData.selected_age,
            is_free_entry: bardDetailsData.is_free_entry,
            free_entry_till: bardDetailsData.free_entry_till,
            can_pay_with_card_entry: bardDetailsData.can_pay_with_card_entry,
            can_pay_with_card_consumption: bardDetailsData.can_pay_with_card_consumption,
            music_category_id: bardDetailsData.music_category_id,
            music_category_name: bardDetailsData.music_category_name,

            //Detail
            drinks: bardDetailsData.drinks,
            dance: bardDetailsData.dance,
            casual: bardDetailsData.casual,
            good_to_go_with_group: bardDetailsData.good_to_go_with_group,

            //Services options
            dine_In: bardDetailsData.dine_In,
            delivery: bardDetailsData.delivery,
            take_way: bardDetailsData.take_way,

            ///Acessibility
            accessible_parking: bardDetailsData.accessible_parking,
            step_free_entry: bardDetailsData.step_free_entry,
            accessible_restrooms: bardDetailsData.accessible_restrooms,
            elevator_or_ramps: bardDetailsData.elevator_or_ramps,
            wide_corridors: bardDetailsData.wide_corridors,
            braille_signage: bardDetailsData.braille_signage,
            mobility_assistance: bardDetailsData.mobility_assistance,
            service_dog_access: bardDetailsData.service_dog_access,
            audio_description_or_visual_guide: bardDetailsData.audio_description_or_visual_guide,
            accessible_communication: bardDetailsData.accessible_communication,

            ///Convenience
            convenience_parking: bardDetailsData.convenience_parking,
            wi_fi_access: bardDetailsData.wi_fi_access,
            outdoor_seating: bardDetailsData.outdoor_seating,
            indoor_seating: bardDetailsData.indoor_seating,
            takeout_or_to_go_orders: bardDetailsData.takeout_or_to_go_orders,
            delivery_service: bardDetailsData.delivery_service,
            reservation_service: bardDetailsData.reservation_service,
            drive_through: bardDetailsData.drive_through,
            online_ordering: bardDetailsData.online_ordering,
            atm_access: bardDetailsData.atm_access,

            // Menu Options
            dining: bardDetailsData.dining,
            alcoholic_beverages: bardDetailsData.alcoholic_beverages,
            shisha: bardDetailsData.shisha,
            wine_selection: bardDetailsData.wine_selection,
            beer_selection: bardDetailsData.beer_selection,
            cocktails: bardDetailsData.cocktails,
            non_alcoholic_beverages: bardDetailsData.non_alcoholic_beverages,
            coffee_and_tea: bardDetailsData.coffee_and_tea,
            desserts: bardDetailsData.desserts,
            vegetarian: bardDetailsData.vegetarian,
            vegan_options: bardDetailsData.vegan_options,

            // Atmosphere
            dance_floor: bardDetailsData.dance_floor,
            casual_setting: bardDetailsData.casual_setting,
            formal_setting: bardDetailsData.formal_setting,
            live_music: bardDetailsData.live_music,
            karaoke: bardDetailsData.karaoke,
            outdoor_seating_atmosphere: bardDetailsData.outdoor_seating_atmosphere,
            bar_area: bardDetailsData.bar_area,
            good_for_groups: bardDetailsData.good_for_groups,
            intimate_setting: bardDetailsData.intimate_setting,
            family_friendly: bardDetailsData.family_friendly,
            lounge_area: bardDetailsData.lounge_area,

            // Public type
            good_for_groups_public: bardDetailsData.good_for_groups_public,
            family_friendly_public: bardDetailsData.family_friendly_public,
            kid_friendly: bardDetailsData.kid_friendly,
            adults_only: bardDetailsData.adults_only,
            solo_friendly: bardDetailsData.solo_friendly,
            pet_friendly: bardDetailsData.pet_friendly,
            lgbtq_plus_friendly: bardDetailsData.lgbtq_plus_friendly,
            accessible_to_all: bardDetailsData.accessible_to_all,
            couples_retreat: bardDetailsData.couples_retreat,
            student_friendly: bardDetailsData.student_friendly,

            // Planning
            reservations_accepted: bardDetailsData.reservations_accepted,
            walk_ins_welcome: bardDetailsData.walk_ins_welcome,
            private_events: bardDetailsData.private_events,
            event_planning_services: bardDetailsData.event_planning_services,
            catering_services: bardDetailsData.catering_services,
            table_reservations: bardDetailsData.table_reservations,
            online_booking: bardDetailsData.online_booking,
            event_space_rental: bardDetailsData.event_space_rental,
            party_packages: bardDetailsData.party_packages,
            custom_event_packages: bardDetailsData.custom_event_packages,

            // Payment Options
            credit_cards_accepted: bardDetailsData.credit_cards_accepted,
            debit_cards_accepted: bardDetailsData.debit_cards_accepted,
            cash_only: bardDetailsData.cash_only,
            mobile_payments: bardDetailsData.mobile_payments,
            contactless_payments: bardDetailsData.contactless_payments,
            online_payments: bardDetailsData.online_payments,
            checks: bardDetailsData.checks,
            split_bills: bardDetailsData.split_bills,
            gift_cards: bardDetailsData.gift_cards,
            crypto_currency: bardDetailsData.crypto_currency,
            establishment_is_online: bardDetailsData.establishment_is_online,
            extra_info: bardDetailsData.extra_info,
        });

        // Salvar o objeto BarDetail no banco de dados
        const savedBarDetail = await barDetail.save();
        return res.status(201).json({ success: true, barDetail: savedBarDetail });
    } catch (error) {
        console.error(`Error creating BarDetail: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;