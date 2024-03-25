import mongoose from "mongoose";
import { Router } from "express";
import Establishment from "../../models/Establishment/Establishment.js";
import MusicCategory from "../../models/MusicCategory.js";
import checkToken from "../../middleware/checkToken.js";
import KioskDetail from "../../models/Establishment/Details/KioskDetail.js";
import PromoterDetail from "../../models/Establishment/Details/PromoterDetail.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import CityAndCountry from "../../models/CityAndCountry.js";
const router = Router();

router.post("/promoter-detail/:establishmentId",  async (req, res, next) => {
    try {
        const promoterDetailsData = req.body;
        const establishmentId = req.params.establishmentId;

        // Verificar se o estabelecimento existe
        const establishmentObj = await Establishment.findById(establishmentId);
        if (!establishmentObj) {
            return res.status(422).json({ error: 'establishmentDoesNotExist' });
        }
        // Verificar se o tipo do estabelecimento é um promoter
        if (establishmentObj.companyType !== 'promoter') {
            return res.status(422).json({ error: 'EstablishmentNotKioskType' });
        }
        // Verificar se já existe um registro promoterDetail para o establishmentId
        const existingPromoterDetail = await PromoterDetail.findOne({ establishmentId: establishmentId });
        if (existingPromoterDetail) {
            return res.status(422).json({ error: 'EstablishmentIdDetailAlreadyRegistered' });
        }

        // Criar um novo objeto PromoterDetail
        const promoterDetail = new PromoterDetail({
            establishmentId: establishmentId,
            description: promoterDetailsData.description,
            location: promoterDetailsData.location,
            extraInfo: promoterDetailsData.extraInfo,
            contactInfo: promoterDetailsData.contactInfo,
            musicGenre: promoterDetailsData.musicGenre,
        });

        // Salvar o objeto promoterDetail no banco de dados
        const savedPromoterDetail = await promoterDetail.save();
        return res.status(201).json({ success: true, promoterDetail: savedPromoterDetail });
    } catch (error) {
        console.error(`Error creating promoterDetail: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;