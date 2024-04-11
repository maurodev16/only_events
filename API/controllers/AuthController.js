import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const signInFromJwt = id => {
    return jwt.sign({ id },
        process.env.AUTH_SECRET_KEY, {
        expiresIn: process.env.EXPIRES_IN
    });

}
export default signInFromJwt;