const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const Promoter = require('../models/Promoter');
const checkPromoterToken = require('../middleware/checkPromoterToken');

router.post('/create', checkPromoterToken, async (req, res) => {
    try {
      const { artist_name, genre, biography,  banner, photos, socialMedia, contact, discography, streamingLinks, awards } = req.body;
  
      // Verifique se o usuário logado é um promotor antes de permitir a criação do artista
      const promoterId = req.promoter._id; // Promoter ID obtained from the token
      const promoterData = await Promoter.findById(promoterId);
      if (!promoterData) {
        return res.status(404).json({ error: "Promoter not found" });
      }
  
      // Crie um novo objeto do tipo Artist com as informações fornecidas
      const newArtist = new Artist({
        artist_name,
        genre,
        biography,
        banner,
        photos,
        socialMedia,
        contact,
        discography,
        streamingLinks,
        awards,
        promoterId: promoterData._id // Associe o promotor ao artista criado
      });
  
      // Salve o novo artista no banco de dados
      const createdArtist = await newArtist.save();
  
      res.status(201).json(createdArtist);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar o artista.' });
    }
  });
  

module.exports = router;
