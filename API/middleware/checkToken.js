import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

if (!AUTH_SECRET_KEY) {
  throw new Error('AUTH_SECRET_KEY is not defined');
}

// Middleware para verificar o token
async function checkToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ auth: false, msg: 'No Token Provided.' });
    }

    // Verifica e decodifica o token
    jwt.verify(token, AUTH_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(500).json({ auth: false, msg: 'Failed to authenticate token.' });
      }
      
      // Se o token for válido, salva o ID de autenticação na requisição
      req.auth = { _id: decoded.id };
    console.log( req.auth)
      next();
    });
  } catch (error) {
    console.error('Error on token authentication:', error);
    return res.status(500).json({ auth: false, msg: 'Error on token authentication.' });
  }
}

export default checkToken;
