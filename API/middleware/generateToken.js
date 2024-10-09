import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/UserModel/User.js";

dotenv.config();

const generateToken = async (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_TIME } // Expira em um período curto
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET, // Use a nova variável
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_TIME } // Expira em um período mais longo
  );

  // Salve o refresh token no banco de dados associado ao usuário
  await User.findByIdAndUpdate(userId, { refreshToken });

  return { accessToken, refreshToken };
};

export default generateToken;
