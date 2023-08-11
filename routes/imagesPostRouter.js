const cloudinary = require('../services/cloudinaryConfig');
const Promoter = require('../models/Promoter');
const Event = require('../models/Event');
const { v4: uuidv4 } = require('uuid');
const uploadArray = require('../middleware/multerArrayMiddleware');
const checkPromoterToken = require('../middleware/checkPromoterToken');
const { deleteImageFromCloudinary } = require("../services/cloudinary")
const router = require('express').Router()

IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;

router.post('/upload-images/:promoterId', uploadArray.array('images', 6), checkPromoterToken, async (req, res) => {
    const { promoterId } = req.params;
    const folderPath = `promoters/posts/${promoterId}`;
    const imageUrls = [];

    try {
        // Verificar se o promoter existe
        const promoter = await Promoter.findById(promoterId);
        if (!promoter) {
            return res.status(404).json({ message: 'Promoter not found' });
        }

        // Verificar se pelo menos uma imagem foi enviada
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        } else {
            // Fazer o upload das imagens para o Cloudinary
            for (const file of req.files) {
                const public_id = `${promoterId}-${file.originalname.split('.')[0]}`;

                const result = await cloudinary.uploader.upload(file.path, {
                    public_id: public_id,
                    overwrite: false,
                    folder: folderPath,
                    transformation: [
                        { height: 500, width: 500, crop: 'fit' }
                    ]
                });
                imageUrls.push(result.secure_url);
            }
        }
        // Criar o novo evento no banco de dados
        const newEvent = new Event({
            post_images_urls: imageUrls,
            promoter: promoterId
        });

        const savedEvent = await newEvent.save();

        return res.status(201).json({ message: 'Images uploaded successfully', event: savedEvent });
    } catch (error) {
        console.error('Error uploading images:', error);
        return res.status(500).json({ message: 'Failed to upload images' });
    }
});

module.exports = router;
