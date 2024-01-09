import express from 'express';
const router = express.Router();
import Artist from '../models/Artist.js';
import User from '../models/User.js';
import checkToken from '../middleware/checkToken.js';


router.post('/create', checkToken, async (req, res) => {
    try {
      const { artist_name, genre, biography,  banner, photos, socialMedia, contact, discography, streamingLinks, awards } = req.body;
  
      // Verifique se o usuário logado é um promotor antes de permitir a criação do art
      const userId = req.user._id; // Promoter ID obtained from the token
      const userData = await User.findById(userId);
      if (!userData) {
        return res.status(404).json({ error: "user not found" });
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
  

export default router;
