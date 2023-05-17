require('dotenv').config();
const jwt = require('jsonwebtoken');
const PARTICIPANT_SECRET_KEY = process.env.PARTICIPANT_SECRET_KEY;

// Middleware to check participant token
function checkParticipantToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ auth: false, msg: 'Token not provided.' });
  }

  jwt.verify(token, PARTICIPANT_SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.status(500).json({ auth: false, msg: 'Failed to authenticate token.' });
    }

    // If the token is valid, save the participant ID in the request
    req.participant = { _id: decoded.participantId };
    next();
  });
}

module.exports = checkParticipantToken;
