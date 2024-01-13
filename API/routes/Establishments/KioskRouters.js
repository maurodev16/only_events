import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment.js";
import cloudinary from "../../services/Cloudinary/cloudinary_config.js";
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import uploadSingleBanner from "../../middleware/multerSingleBannerMiddleware.js";
import KioskDetail from "../../models/KioskDetail.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
const router = Router();

router.post("/kiosk-detail/:establishmentId", uploadSingleBanner.single("file"), async (req, res, next) => {
    try {
        const kioskDetailsData = req.body;
        const establishmentId = req.params.establishmentId;

        // Verificar se o estabelecimento existe
        const establishmentObj = await Establishment.findById(establishmentId);
        if (!establishmentObj) {
            return res.status(422).json({ error: 'establishmentDoesNotExist' });
        }
        // Verificar se o tipo do estabelecimento é um Kiosk
        if (establishmentObj.company_type !== 'kiosk') {
            return res.status(422).json({ error: 'EstablishmentNotKioskType' });
        }
        // Verificar se já existe um registro KioskDetail para o establishmentId
        const existingKioskDetail = await KioskDetail.findOne({ establishment_id: establishmentId });
        if (existingKioskDetail) {
            return res.status(422).json({ error: 'EstablishmentIdDetailAlreadyRegistered' });
        }

        // Criar um novo objeto BarDetail
        const kioskDetail = new KioskDetail({
            establishment_id: establishmentId,
            // opening_hours: [openingHoursSchema],
            //Services options
            delivery: kioskDetailsData.delivery,
            ///Convenience
            indoor_seating: kioskDetailsData.indoor_seating,
            atm_access: kioskDetailsData.atm_access,
            ///Menu Options
            electronic_cigarette: kioskDetailsData.electronic_cigarette,
            shisha: kioskDetailsData.shisha,
            wine_selection: kioskDetailsData.wine_selection,
            beer_selection: kioskDetailsData.beer_selection,
            cocktails: kioskDetailsData.cocktails,
            non_alcoholic_beverages: kioskDetailsData.non_alcoholic_beverages,
            coffee_and_tea: kioskDetailsData.coffee_and_tea,
            desserts: kioskDetailsData.desserts,
            vegetarian: kioskDetailsData.vegetarian,
            vegan_options: kioskDetailsData.vegan_options,
            ///Atmosphere
            outdoor_seating_atmosphere: kioskDetailsData.outdoor_seating_atmosphere,
            bar_area: kioskDetailsData.bar_area,
            //Payment Options
            credit_cards_accepted: kioskDetailsData.credit_cards_accepted,
            debit_cards_accepted: kioskDetailsData.debit_cards_accepted,
            cash_only: kioskDetailsData.cash_only,
            mobile_payments: kioskDetailsData.mobile_payments,
            contactless_payments: kioskDetailsData.contactless_payments,
            online_payments: kioskDetailsData.online_payments,
            establishment_is_online: kioskDetailsData.establishment_is_online,
            extra_info: kioskDetailsData.extra_info,
        });

        // Salvar o objeto KioskDetail no banco de dados
        const savedKioskDetail = await kioskDetail.save();
        return res.status(201).json({ success: true, kioskDetail: savedKioskDetail });
    } catch (error) {
        console.error(`Error creating KioskDetail: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;