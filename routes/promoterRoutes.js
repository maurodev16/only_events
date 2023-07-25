require('dotenv').config();
const router = require('express').Router()
const Promoter = require('../models/Promoter');
const City = require('../models/City');
const bcrypt = require('bcrypt');
const checkPromoterToken = require('../middleware/checkPromoterToken');
const uploadAvatar = require('../middleware/multerPromoterMiddleware');
const { uploadToCloudinary } = require('../services/cloudinary');
const fs = require('fs');
const mongoose = require('mongoose');

IMAGE_AVATAR_DEFAULT_TOKEN = process.env.IMAGE_AVATAR_DEFAULT_TOKEN;

router.post('/register', uploadAvatar.single('avatar'), async (req, res) => {
  const {
    full_name,
    company,
    email,
    password,
    logo_url,
    phone,
    cityName,
    street_name,
    hause_number,
    post_code
  } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // Valida os dados do Promoter
    if (!full_name) {
      res.status(422).json({ msg: "Full name required!" });
      return;
    }

    if (!company) {
      res.status(422).json({ msg: "Company name required!" });
      return;
    }

    if (!cityName) {
      res.status(422).json({ msg: "City name required!" });
      return;
    }

    if (!street_name) {
      res.status(422).json({ msg: "Street name required!" });
      return;
    }

    if (!hause_number) {
      res.status(422).json({ msg: "Hause number required!" });
      return;
    }
    if (!post_code) {
      res.status(422).json({ msg: "Postcode required!" });
      return;
    }

    // Verifica se a cidade já existe no banco de dados
    let city = await City.findOne({ cityName });
    if (!city) {
      res.status(422).json({ msg: "City not found!" });
      return;
    }

    // Verifica se o email do Promoter já está em uso
    const emailExists = await Promoter.findOne({ email: email });
    if (emailExists) {
      res.status(422).json({ msg: "Email already exists!" });
      return;
    }

    // Cria o hash da senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    let logo_url = ''; // Inicializa a variável da URL da imagem

    if (req.file) {
      // Faz o upload da imagem para o Cloudinary
      const imagePath = req.file.path;
      const folder = 'avatars'; // Pasta no Cloudinary onde deseja armazenar a imagem
      const result = await uploadToCloudinary(imagePath, folder);
      logo_url = result.url // Define a URL da imagem retornada pelo Cloudinary

      // Deleta a imagem do servidor após o upload para o Cloudinary
      fs.unlinkSync(imagePath);
    } else {
      // Define uma URL padrão caso nenhuma imagem tenha sido enviada
      logo_url = `https://firebasestorage.googleapis.com/v0/b/evento-app-5a449.appspot.com/o/default-avatar.png?alt=media&token=${IMAGE_AVATAR_DEFAULT_TOKEN}`;
    }

    // Cria o Promoter
    const promoter = new Promoter({
      full_name,
      company,
      email,
      password: passwordHash,
      logo_url,
      phone,
      city: city._id,
      street_name,
      hause_number,
      post_code,

    });

    const createdPromoter = await promoter.save({ session });

    // Verificação do resultado do salvamento
    if (!createdPromoter) {
      throw new Error('Erro to save promoter on Database');
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion

    res.status(200).json({ msg: `Welcome ${createdPromoter.full_name}!` });
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.log(`Erro to register Company: ${error}`);
    res.status(500).send({msg:`Erro to register Promoter: ${error}`});
  }
});

router.get('/fetch', checkPromoterToken, async (req, res) => {
  try {
     const promoter = await Promoter.find().select('-password');
    if (!promoter) {
      return res.status(404).json({ msg: "Company not Found" });
    }
    res.status(200).json(promoter)
  } catch (error) {
    res.status(500).json({ error: error })
  }
});

router.get('/:id', checkPromoterToken, async (req, res) => {
  const id = req.params.id;

  try {
    const promoter = await Promoter.findById(id, '-password');
    if (!promoter) {
      return res.status(404).json({ msg: "Company not Found!" });
    }
    res.status(200).json(promoter)
  } catch (error) {
    res.status(500).json({ error: error })
  }
});

router.put('/editPromoter/:promoterId', checkPromoterToken, async (req, res) => {
  try {
    const promoterId = req.params.userId;
    const promoterData = req.body;
    // Verificar se o user existe
    const promoter = await Promoter.findById(promoterId);
    if (!promoter) {
      return res.status(404).json({ msg: "Company not Found!" });
    }

    // Atualizar os dados do user
    promoter.full_name = promoterData.full_name;
    promoter.password = promoterData.password;
    promoter.dateOfBirth = promoterData.dateOfBirth;
    promoter.gender = promoterData.gender;
    promoter.interest = promoterData.interest;
    promoter.street_name = promoterData.street_name;
    promoter.hause_number = promoterData.hause_name;
    promoter.phone = promoterData.phone;
    promoter.logo_url = promoterData.logo_url;
    promoter.updated = Date.now();

    // Salvar as alterações no banco de dados
    const updatedpromoter = await promoter.save();

    res.status(200).json(updatedpromoter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/editPromoter/:promoterId', checkPromoterToken, async (req, res) => {
  try {
    const promoterId = req.params.promoterId;
    const promoterData = req.body;

    // Check if the promoter exists
    const promoter = await Promoter.findById(promoterId);
    if (!promoterData) {
      return res.status(404).json({ msg: "Company not Found!" });
    }

    // Check if the logged-in promoter has permission to edit the user
    if (promoter._id.toString() !== req.promoter._id) {
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    // Update the promoter data
    // Atualizar os dados do promoter
    promoter.full_name = promoterData.full_name;
    promoter.password = promoterData.password;
    promoter.dateOfBirth = promoterData.dateOfBirth;
    promoter.gender = promoterData.gender;
    promoter.interest = promoterData.interest;
    promoter.hause_number = promoterData.hause_number;
    promoter.street_name = promoterData.street_name;
    promoter.phone = promoterData.phone;
    promoter.logo_url = promoterData.logo_url;
    promoter.updated = Date.now();

    // Save the updated promoter data to the database
    const updatedPromoter = await promoter.save();

    res.status(200).json(updatedPromoter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router
