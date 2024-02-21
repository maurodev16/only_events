import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment/Establishment.js";
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import KioskDetail from "../../models/Establishment/Details/KioskDetail.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
const router = Router();

router.post("/kiosk-detail/:establishmentId",  async (req, res, next) => {
    try {
        const kioskDetailsData = req.body;
        const establishmentId = req.params.establishmentId;

        // Verificar se o estabelecimento existe
        const establishmentObj = await Establishment.findById(establishmentId);
        if (!establishmentObj) {
            return res.status(422).json({ error: 'establishmentDoesNotExist' });
        }
        // Verificar se o tipo do estabelecimento é um Kiosk
        if (establishmentObj.companyType !== 'kiosk') {
            return res.status(422).json({ error: 'EstablishmentNotKioskType' });
        }
        // Verificar se já existe um registro KioskDetail para o establishmentId
        const existingKioskDetail = await KioskDetail.findOne({ establishmentId: establishmentId });
        if (existingKioskDetail) {
            return res.status(422).json({ error: 'EstablishmentIdDetailAlreadyRegistered' });
        }

        // Criar um novo objeto BarDetail
        const kioskDetail = new KioskDetail({
            establishmentId: establishmentId,
            // openingHours: [openingHoursSchema],
            //Services options
            delivery: kioskDetailsData.delivery,
            ///Convenience
            indoorSeating: kioskDetailsData.indoorSeating,
            atmAccess: kioskDetailsData.atmAccess,
            ///Menu Options
            electronicCigarette: kioskDetailsData.electronicCigarette,
            shisha: kioskDetailsData.shisha,
            wineSelection: kioskDetailsData.wineSelection,
            beerSelection: kioskDetailsData.beerSelection,
            cocktails: kioskDetailsData.cocktails,
            nonAlcoholicBeverages: kioskDetailsData.nonAlcoholicBeverages,
            coffeeAndTea: kioskDetailsData.coffeeAndTea,
            desserts: kioskDetailsData.desserts,
            vegetarian: kioskDetailsData.vegetarian,
            veganOptions: kioskDetailsData.veganOptions,
            ///Atmosphere
            outdoorSeatingAtmosphere: kioskDetailsData.outdoorSeatingAtmosphere,
            barArea: kioskDetailsData.barArea,
            //Payment Options
            creditCardsAccepted: kioskDetailsData.creditCardsAccepted,
            debitCardsAccepted: kioskDetailsData.debitCardsAccepted,
            cashOnly: kioskDetailsData.cashOnly,
            mobilePayments: kioskDetailsData.mobilePayments,
            contactlessPayments: kioskDetailsData.contactlessPayments,
            onlinePayments: kioskDetailsData.onlinePayments,
            establishmentIsOnline: kioskDetailsData.establishmentIsOnline,
            extraInfo: kioskDetailsData.extraInfo,
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