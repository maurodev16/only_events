import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not defined");
}

// Middleware para verificar o access token
async function checkAccessToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ auth: false, error: "No Access Token Provided." });
    }

    const accessToken = authHeader.split(' ')[1];

    // Verifica e decodifica o access token
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          console.error("Access token expired:", err);
          return res.status(401).json({ error: "Access Token Expired", expiredAt: err.expiredAt });
        } else {
          console.error("Error verifying access token:", err);
          return res.status(401).json({ error: "Invalid Access Token" });
        }
      }

      // Adiciona o ID do usuário ao objeto req para o próximo middleware
      req.auth = { _id: decoded.id };
      next();
    });
  } catch (error) {
    console.error("Error on access token authentication:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default checkAccessToken;
