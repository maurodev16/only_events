import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const EXPIRES_IN = process.env.EXPIRES_IN;
dotenv.config();
if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined');
}

function signInFromJwt(userId) {
  const token = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: EXPIRES_IN });
  return token;
}

export default signInFromJwt;
