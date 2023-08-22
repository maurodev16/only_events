require('dotenv').config();
const router = require('express').Router()
const User = require('../models/User');
const City = require('../models/City');
const bcrypt = require('bcrypt');
const checkToken = require('../middleware/checkToken');


const mongoose = require('mongoose');

router.post('/complete-profile',  async (req, res) => {
  const {
    logo_url,
    full_name,
    company,
    phone,
    street_name,
    hause_number,
    post_code,
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
    // const salt = await bcrypt.genSalt(12);
    // const hashedPassword = await bcrypt.hash(password, salt);

   // Create a new user
   const newUser = new User({
    logo_url,
    full_name,
    company,
    phone,
    street_name,
    hause_number,
    post_code,
    city,
    music_preferences,
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
    const user = await User.find().select('-password');
    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }
    res.status(200).send(user)
  } catch (error) {
    res.status(500).send(error)
  }
});

router.get('/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, '-password');
    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error })
  }
});

router.put('/editUser/:userId', checkToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    // Verificar se o user existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }

    // Atualizar os dados do user
    user.full_name = userData.full_name;
    user.password = userData.password;
    user.dateOfBirth = userData.dateOfBirth;
    user.gender = userData.gender;
    user.interest = userData.interest;
    user.street_name = userData.street_name;
    user.hause_number = userData.hause_name;
    user.phone = userData.phone;
    user.logo_url = userData.logo_url;
    user.updated = Date.now();

    // Salvar as alterações no banco de dados
    const updateduser = await user.save();

    res.status(200).json(updateduser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/edituser/:userId', checkToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!userData) {
      return res.status(404).send("UserNotFoundException");
    }

    // Check if the logged-in user has permission to edit the user
    if (user._id.toString() !== req.user._id) {
      return res.status(403).send("UnauthorizedAccessException");
    }

    // Update the user data
    // Atualizar os dados do user
    user.full_name = userData.full_name;
    user.password = userData.password;
    user.dateOfBirth = userData.dateOfBirth;
    user.gender = userData.gender;
    user.interest = userData.interest;
    user.hause_number = userData.hause_number;
    user.street_name = userData.street_name;
    user.phone = userData.phone;
    user.logo_url = userData.logo_url;
    user.updated = Date.now();

    // Save the updated user data to the database
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router
