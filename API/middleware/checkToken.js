import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

// Middleware to check token
function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ auth: false, msg: 'Token not provided.' });
  }

  jwt.verify(token, AUTH_SECRET_KEY, function (err, decoded) {
    if (err) {
      return res.status(500).json({ auth: false, msg: 'Failed to authenticate token.' });
    }

    // If the token is valid, save the Auth ID in the request
    req.auth = { _id: decoded._id };
    next();
  });
}

export default  checkToken;
