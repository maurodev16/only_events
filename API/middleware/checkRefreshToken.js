import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/UserModel/User.js";

dotenv.config();

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is not defined");
}

// Middleware para verificar o refresh token
async function checkRefreshToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No Refresh Token Provided." });
    }

    const refreshToken = authHeader.split(' ')[1];

    if (!refreshToken) {
      return res.status(401).json({ error: "No Refresh Token Provided." });
    }

    // Verifica o refresh token com REFRESH_TOKEN_SECRET
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(403).json({ error: "Refresh Token Expired. Please log in again." });
        }
        return res.status(403).json({ error: "Invalid Refresh Token. Please log in again." });
      }

      // Encontrar o usuário correspondente ao ID no token decodificado
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }

      // Gere um novo access token
      const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_TIME,
      });

      // Retorne o novo access token
      return res.status(200).json({
        accessToken,
      });
    });
  } catch (error) {
    console.error(`Error on refreshing token: ${error}`);
    return res.status(500).json({ error: "An error occurred while refreshing the token." });
  }
}

export default checkRefreshToken;
