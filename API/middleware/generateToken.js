import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (userId, isCompany)=> {
    return jwt.sign({ id: userId, isCompany },
        process.env.AUTH_SECRET_KEY, {
        expiresIn: process.env.EXPIRES_IN
    });

}
export default generateToken;