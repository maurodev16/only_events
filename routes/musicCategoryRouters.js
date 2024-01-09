import dotenv from 'dotenv';
import { Router } from 'express';
import MusicCategory from '../models/MusicCategory.js';

dotenv.config();

const router = Router();


router.post('/create', async (req, res) => {
    // Body
    const { music_category_name } = req.body;

    try {
        // Check if music_category_name is provided
        if (!music_category_name) {
            res.status(422).json({ msg: "O nome do estilo de música é obrigatório!" });
            return;
        }

        // Check if music style already exists
        const music_category_nameExists = await MusicCategory.findOne({ music_category_name: music_category_name });
        if (music_category_nameExists) {
            res.status(422).json({ msg: "Já existe um estilo de música com este nome!" });
            return;
        }

        // Create a new music style
        const musicCategory = new MusicCategory({ music_category_name });
        const created = await musicCategory.save();

        if (created) {
            res.status(200).json({ created });
        }
    } catch (error) {
        console.log(`Erro ao criar: ${error}`);
        res.status(500).json({ msg: "Erro ao cadastrar, tente novamente mais tarde!" });
    }
});

///
router.get('/fetch', async (req, res) => {
    try {
      const musicCategory = await MusicCategory.find({}).select('-__v');
      
  
      if (musicCategory.length === 0) {
        return res.status(404).send("Music Styles not found");
      }
      return res.status(201).json(musicCategory);
  
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

export default router;
