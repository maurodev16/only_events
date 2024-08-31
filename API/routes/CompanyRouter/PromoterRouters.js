import mongoose from "mongoose";
import { Router } from "express";
import checkToken from "../../middleware/checkToken.js";
import Promoter from "../../models/PromoterModel/PromoterModel.js"
const router = Router();

router.post("/promoter-detail/:companyId",  async (req, res, next) => {
    try {
        const promoterDetailsData = req.body;
        const companyId = req.params.companyId;

        // Verificar se a company existe
        const companyObj = await Promoter.findById(companyId);
        if (!companyObj) {
            return res.status(422).json({ error: 'companyDoesNotExist' });
        }
        // Verificar se o tipo do companyelecimento é um promoter
        if (companyObj.companyType !== 'promoter') {
            return res.status(422).json({ error: 'CompanyNotKioskType' });
        }
        // Verificar se já existe um registro promoterDetail para o companyId
        const existingPromoterDetail = await PromoterDetail.findOne({ companyId: companyId });
        if (existingPromoterDetail) {
            return res.status(422).json({ error: 'CompanyIdDetailAlreadyRegistered' });
        }

        // Criar um novo objeto PromoterDetail
        const promoterDetail = new Promoter({
            companyId: companyId,
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