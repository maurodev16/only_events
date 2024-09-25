import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const EXPIRES_IN = process.env.EXPIRES_IN;
dotenv.config();
if (!AUTH_SECRET_KEY) {
  throw new Error('AUTH_SECRET_KEY is not defined');
}

function signInFromJwt(userId) {
  const token = jwt.sign({ id: userId }, AUTH_SECRET_KEY, { expiresIn: EXPIRES_IN });
  return token;
}

export default signInFromJwt;
