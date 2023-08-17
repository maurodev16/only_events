require('dotenv').config();
const router = require('express').Router()
const User = require('../models/User');
const City = require('../models/City');
const bcrypt = require('bcrypt');
const checkToken = require('../middleware/checkToken');


const mongoose = require('mongoose');

router.post('/signup',  async (req, res) => {
  const {
    logo_url,
    full_name,
    company,
    email,
    password,
    phone,
    street_name,
    hause_number,
    post_code,
    is_company,
    music_preferences,
    city,
  } = req.body;

  const session = await mongoose.startSession();

try {
   session.startTransaction(); // Iniciar transação

    // // Verifica se a cidade já existe no banco de dados
    // let cityName = await City.findOne({ cityName });
   

    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      res.status(422).send("EmailAlreadyExistsException");
      return;
    }
    
    // Cria o hash da senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

   // Create a new user
   const newUser = new User({
    logo_url,
    full_name,
    company,
    email,
    password: hashedPassword,
    phone,
    street_name,
    hause_number,
    post_code,
    is_company,
    city,
    music_preferences,
    role: is_company ? 'company' : 'private'
  });

    const created = await newUser.save({ session });

    // Verificação do resultado do salvamento
    if (!created) {
      throw new Error('ErroSavePromoterOnDatabaseException');
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion

    res.status(201).send('User registered successfully');
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.log(`Erro to register Company: ${error}`);
    res.status(500).send('ErroRegisterPromoterException');
  }
});




router.get('/fetch', checkToken, async (req, res) => {
  try {
    const promoter = await Promoter.find().select('-password');
    if (!promoter) {
      return res.status(404).send("CompanyNotFoundException");
    }
    res.status(200).send(promoter)
  } catch (error) {
    res.status(500).send(error)
  }
});

router.get('/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const promoter = await Promoter.findById(id, '-password');
    if (!promoter) {
      return res.status(404).send("CompanyNotFoundException");
    }
    res.status(200).json(promoter)
  } catch (error) {
    res.status(500).json({ error: error })
  }
});

router.put('/editPromoter/:promoterId', checkToken, async (req, res) => {
  try {
    const promoterId = req.params.userId;
    const promoterData = req.body;
    // Verificar se o user existe
    const promoter = await Promoter.findById(promoterId);
    if (!promoter) {
      return res.status(404).send("CompanyNotFoundException");
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

router.put('/editPromoter/:promoterId', checkToken, async (req, res) => {
  try {
    const promoterId = req.params.promoterId;
    const promoterData = req.body;

    // Check if the promoter exists
    const promoter = await Promoter.findById(promoterId);
    if (!promoterData) {
      return res.status(404).send("CompanyNotFoundException");
    }

    // Check if the logged-in promoter has permission to edit the user
    if (promoter._id.toString() !== req.promoter._id) {
      return res.status(403).send("UnauthorizedAccessException");
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
