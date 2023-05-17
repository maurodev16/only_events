require('dotenv').config();
const router = require('express').Router();
const Promoter = require('../models/Promoter');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const PROMOTER_SECRET_KEY = process.env.PROMOTER_SECRET_KEY;

// Login route
router.post('/loginPromoter', async (req, res) => {
  try {
    const { nicknameOrEmail, password } = req.body;

    // Validate Promoter data
    if (!nicknameOrEmail) {
      res.status(422).json({ msg: "Please provide a valid nickname or email!" });
      console.log(nicknameOrEmail);
      return;
    }

    let promoter;

   // Check if nicknameOrEmail is an email using regular expression
   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nicknameOrEmail);

   if (isEmail) {
    promoter = await Promoter.findOne({ email: nicknameOrEmail });
    console.log(nicknameOrEmail);

   } else {
     // Find promoter using nickname
     promoter = await Promoter.findOne({ nickname: { $regex: `^${nicknameOrEmail}`, $options: 'i' } });
     console.log(promoter);
   }

    if (!promoter) {
      res.status(404).json({ msg: "No Promoter found with this nickname/email!" });
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

    // Return the authentication token
    res.status(200).json({ msg: "Authentication successful!", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "An error occurred during login." });
  }
});


module.exports = router;
