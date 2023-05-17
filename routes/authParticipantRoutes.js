require('dotenv').config();
const router = require('express').Router();
const Participant = require('../models/Participant');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const PARTICIPANT_SECRET_KEY = process.env.PARTICIPANT_SECRET_KEY;

// Login route
router.post('/loginParticipant', async (req, res) => {
  try {
    const { nicknameOrEmail, password } = req.body;

    // Validate Participant data
    if (!nicknameOrEmail) {
      res.status(422).json({ msg: "Please provide a valid nickname or email!" });
      return;
    }

    let participant;

   // Check if nicknameOrEmail is an email using regular expression
   const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nicknameOrEmail);

   if (isEmail) {
     participant = await Participant.findOne({ email: nicknameOrEmail });
   } else {
     // Find participant using nickname
     participant = await Participant.findOne({ nickname: { $regex: `^${nicknameOrEmail}`, $options: 'i' } });
     console.log(participant);
   }

    if (!participant) {
      res.status(404).json({ msg: "No Participant found with this nickname/email!" });
      return;
    }

    if (!password) {
      res.status(422).json({ msg: "Password is required!" });
      return;
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, participant.password);

    if (!isPasswordValid) {
      res.status(422).json({ msg: 'Incorrect password' });
      return;
    }

    // Generate token
    const token = jwt.sign({ participantId: participant._id }, PARTICIPANT_SECRET_KEY);

    // Return the authentication token
    res.status(200).json({ msg: "Authentication successful!", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "An error occurred during login." });
  }
});


module.exports = router;
