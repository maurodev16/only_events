require('dotenv').config();
const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

 
    // Validate User data
    if (!email) {
      res.status(422).json({ msg: "Please provide a valid email!" });
      console.log(email);
      return;
    }

    let user;

   // Check if Email is an email using regular expression
   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

   if (isEmail) {
    user = await User.findOne({ email: email });
    console.log(email);

   } else {
     // Find user using email
     user = await User.findOne({ email: { $regex: `^${email}`, $options: 'i' } });
     console.log(user);
   }

    if (!user) {
      res.status(404).json({ msg: "No User found with this email!" });
      return;
    }

    if (!password) {
      res.status(422).json({ msg: "Password is required!" });
      return;
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(422).json({ msg: 'Incorrect password' });
      return;
    }


    // Generate token
    const token = jwt.sign({ userId: user._id, userType: user.role }, AUTH_SECRET_KEY);

     // Return the authentication token, ID, and email
     res.status(200).json({ msg: "Authentication successful!", token, id: user._id, email: user.email, userType: user.role });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "An error occurred during login." });
  }
});


module.exports = router;
