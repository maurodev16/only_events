require('dotenv').config();

const router = require('express').Router()
const Logo = require('../models/Logo');
const User = require('../models/Auth');
const City = require('../models/City');
const bcrypt = require('bcrypt');
const checkToken = require('../middleware/checkToken');
const mongoose = require('mongoose');


router.get('/fetch', checkToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');

    if (!users) {
      return res.status(404).send("UserNotFoundException");
    }

    const userdata = users.map(user => {
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        logo_url: user.logo_url,
        role: user.role,
        is_company: user.is_company,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    })
    res.status(200).send(userdata)
  } catch (error) {
    res.status(500).send(error)
  }
});

router.get('/fetchById/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, '-password');
    if (!user) {
      return res.status(404).send("UserNotFoundException");
    }
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ error: error })
  }
});

router.put('/editUser/:id', checkToken, async (req, res) => {
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

    res.status(200).json({updateduser});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/edituser/:id', checkToken, async (req, res) => {
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

    res.status(200).json({updatedUser});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 * /api/v1/complete-profile:
 *   post:
 *     summary: Complete Profile
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User completed successfully
 *       400:
 *         description: Bad request
 */


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 * /api/v1/fetch:
 *   post:
 *     summary: Fetch user data
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 * /api/v1/user/fecthBy/{id}:
 *   post:
 *     summary: Fetch user data By ID
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */