require('dotenv').config();
const router = require('express').Router()
const Promoter = require('../models/Promoter');
const City = require('../models/City');
const bcrypt = require('bcrypt');
const checkPromoterToken = require('../middleware/checkPromoterToken');


const mongoose = require('mongoose');


router.post('/register',  async (req, res) => {
  const {
    full_name,
    company,
    email,
    password,
    phone,
    cityName,
    street_name,
    hause_number,
    post_code,
  } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // Valida os dados do Promoter
    if (!full_name) {
      res.status(422).send("FullNameRequiredException");
      return;
    }

    if (!company) {
      res.status(422).send("CompanyNameRequiredException");
      return;
    }

    if (!cityName) {
      res.status(422).send("CityNameRequiredException");
      return;
    }

    if (!street_name) {
      res.status(422).send("StreetNameRequiredException");
      return;
    }

    if (!hause_number) {
      res.status(422).send("HauseNumberRequiredException");
      return;
    }
    if (!post_code) {
      res.status(422).send("PostCodeRequiredException");
      return;
    }

    // Verifica se a cidade já existe no banco de dados
    let city = await City.findOne({ cityName });
    if (!city) {
      res.status(422).send("CityNotFoundException");
      return;
    }

    // Verifica se o email do Promoter já está em uso
    const emailExists = await Promoter.findOne({ email: email });
    if (emailExists) {
      res.status(422).send("EmailAlreadyExistsException");
      return;
    }
    
    // Cria o hash da senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

  
    // Cria o Promoter
    const promoter = new Promoter({
      full_name,
      company,
      email,
      password: passwordHash,
      phone,
      city: city._id,
      street_name,
      hause_number,
      post_code,
      is_company: true,
    });


    const createdPromoter = await promoter.save({ session });

    // Verificação do resultado do salvamento
    if (!createdPromoter) {
      throw new Error('ErroSavePromoterOnDatabaseException');
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion

    res.status(200).send(`Welcome ${createdPromoter.full_name}!`);
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.log(`Erro to register Company: ${error}`);
    res.status(500).send('ErroRegisterPromoterException');
  }
});




router.get('/fetch', checkPromoterToken, async (req, res) => {
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

router.get('/:id', checkPromoterToken, async (req, res) => {
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

router.put('/editPromoter/:promoterId', checkPromoterToken, async (req, res) => {
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

router.put('/editPromoter/:promoterId', checkPromoterToken, async (req, res) => {
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
