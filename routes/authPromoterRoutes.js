require('dotenv').config();
const router = require('express').Router();
const Promoter = require('../models/Promoter');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const PROMOTER_SECRET_KEY = process.env.PROMOTER_SECRET_KEY;

// Login route
router.post('/loginPromoter', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate Promoter data
    if (!email) {
      res.status(422).json({ msg: "Please provide a valid email!" });
      console.log(email);
      return;
    }

    let promoter;

   // Check if nicknameOrEmail is an email using regular expression
   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

   if (isEmail) {
    promoter = await Promoter.findOne({ email: email });
    console.log(email);

   } else {
     // Find promoter using nickname
     promoter = await Promoter.findOne({ email: { $regex: `^${email}`, $options: 'i' } });
     console.log(promoter);
   }

    if (!promoter) {
      res.status(404).json({ msg: "No Promoter found with this email!" });
      return;
    }

    if (!password) {
      res.status(422).json({ msg: "Password is required!" });
      return;
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, promoter.password);

    if (!isPasswordValid) {
      res.status(422).json({ msg: 'Incorrect password' });
      return;
    }

    // Generate token
    const token = jwt.sign({ promoterId: promoter._id }, PROMOTER_SECRET_KEY);

     // Return the authentication token, ID, and email
     res.status(200).json({ msg: "Authentication successful!", token, id: promoter._id, email: promoter.email });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "An error occurred during login." });
  }
});


module.exports = router;
