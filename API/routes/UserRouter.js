import dotenv from "dotenv";
dotenv.config();

import express from "express";
const router = express.Router();
import User from '../models/User.js';
import checkToken from '../middleware/checkToken.js';


router.get('/fetch', checkToken, async (req, res) => {
  try {
    const users = await User.find().select('-password');

    if (!users) {
      return res.status(404).send("UserNotFoundException");
    }

    const userdata = users.map(user => {
      return {
        id: user._id,
        logoUrl: user.logoUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyType: user.companyType,
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
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.password = userData.password;
    user.gender = userData.gender;
    user.interest = userData.interest;
    user.streetName = userData.streetName;
    user.hauseNumber = userData.hauseNumber;
    user.phone = userData.phone;
    user.logoUrl = userData.logoUrl;
    user.updatedAt = Date.now();

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
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.password = userData.password;
    user.dateOfBirth = userData.dateOfBirth;
    user.gender = userData.gender;
    user.interest = userData.interest;
    user.hauseNumber = userData.hauseNumber;
    user.streetName = userData.streetName;
    user.phone = userData.phone;
    user.logoUrl = userData.logoUrl;
    user.updatedAt = Date.now();

    // Save the updated user data to the database
    const updatedUser = await user.save();

    res.status(200).json({updatedUser});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router


/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 * /api/v1/complete-profile:
 *   establishment:
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
 *   establishment:
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
 *   establishment:
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