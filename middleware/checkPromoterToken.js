require('dotenv').config();
const jwt = require('jsonwebtoken');
const PROMOTER_SECRET_KEY = process.env.PROMOTER_SECRET_KEY;

// Middleware to check promoter token
function checkPromoterToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ auth: false, msg: 'Token not provided.' });
  }

  jwt.verify(token, PROMOTER_SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.status(500).json({ auth: false, msg: 'Failed to authenticate token.' });
    }

    // If the token is valid, save the promoter ID in the request
    req.promoter = { _id: decoded.promoterId };
    next();
  });
}

module.exports =  checkPromoterToken;
