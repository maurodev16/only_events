const cloudinary = require('../services/cloudinaryConfig');
const Promoter = require('../models/Promoter');
const uploadSingle = require('../middleware/multerSingleMiddleware');
const checkPromoterToken = require('../middleware/checkPromoterToken');
const { deleteImageFromCloudinary } = require("../services/cloudinary")
const router = require('express').Router()

IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;



// Rota para fazer o upload da imagem do promoter
router.put('/upload-logo/:promoterId', uploadSingle.single('logo'), checkPromoterToken, async (req, res) => {
    const { promoterId } = req.params;
    var folderPath = `promoters/logos/${promoterId}`
    try {
        // Verificar se o promoter existe
        const promoter = await Promoter.findById(promoterId);
        if (!promoter) {
            return res.status(404).json({ message: 'Promoter not found' });
        }

        // Caminho do arquivo na pasta local
        const path = req.file.path;

        if (path) {
            const result = await cloudinary.uploader.upload(path, {
                public_id: promoterId,
                overwrite: true,
                folder: folderPath,
                transformation: [
                    { height: 50, width: 50, crop: 'fit' }
                ],
            });
          
            const imageUrl = result.secure_url;
     
            // Atualizar o promoter com a URL da imagem
            promoter.logo_url = imageUrl;
       
            console.log("Image url", promoter.logo_url)
            await promoter.save()

            return res.status(200).send(imageUrl);
        } else {
            promoter.logo_url = `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}`;
            return res.status(400).json({ message: 'No image provided' });
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
});
module.exports = router