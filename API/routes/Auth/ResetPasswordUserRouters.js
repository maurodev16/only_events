import User from '../../models/User.js';
import { Router } from 'express';
import checkToken from '../../middleware/checkToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import TokenUser from '../../models/TokenUser.js'; // Importe o modelo TokenEstab
import crypto from 'crypto'; // Importe o módulo 'crypto' para usar a função de hash
import generateResetToken from '../../services/generateResetToken.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const bcryptSalt = process.env.BCRYPT_SALT;
const router = Router();

///- Router to send reset link to user email
router.post('/send-link-reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Please provide an email address!" });
    }

    // Check if the email is valid
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      return res.status(400).json({ error: "Please provide a valid email address!" });
    }

    // Find User by email
    const user = await Establishment.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with this email!" });
    }

    // Generate and save a password reset token
    const resetToken = generateResetToken(user);

    // Check if reset token was generated successfully
    if (!resetToken) {
      return res.status(500).json({ error: "Failed to generate password reset token." });
    }

    await TokenUser.create({ userId: user._id, token: resetToken });

    // Construct reset link
    const resetLink = `${req.protocol}://localhost:3000/api/v1/estab-request/request-reset-password/${resetToken}`;
    
  // Check if reset token was generated successfully
    if (!resetLink) {
      return res.status(500).json({ error: "Failed to generate reset link." });
    }
    // Construct HTML content for the email
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          /* Your CSS styles here */
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset</h2>
          <p>Your new password.</p>
          <p>You are receiving this email because you requested a new password.</p><br>
          <p>Please follow this button to set a new password.</p><br>
          <a href="${resetLink}" target="_blank">Set New Password</a><br>
          <div class="footer">
            <p>This link is valid for 10 minutes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email with password reset link
    const sendEmail = await sendEmailConfig(email, "Password change request received", htmlContent);

    // Return success message
    return res.status(200).json({ msg: "Password reset link has been successfully sent to your email" });
  } catch (error) {
    console.error(`Error sending reset link: ${error}`);
    res.status(500).json({ error: "There was an error sending the password reset email. Please try again later." });
  }
});



//-- Router to Reset user Password

router.post("/request-reset-password/:token", async (req, res) => {
  try {
    const { newPassword } = await req.body;
    const token = req.params.token;

    // Buscar o token no banco de dados
    const tokenUser = await TokenUser.findOne({ token, createdAt: { $gt: Date.now() - 10 * 60 * 1000 } });

    if (!tokenUser) {
      return res.status(401).json({ msg: "Token is invalid or has expired!" });
    }

    // Encontrar o user associado ao token
    const user = await User.findById(tokenUser.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    // Gerar um hash seguro da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Limpar o token de redefinição de senha do estabelecimento
    await TokenUser.deleteOne({ _id: tokenUser._id });

    // Atualizar a senha do User com o hash
    await User.updateOne({ _id: user._id }, { password: hashedPassword, passwordChanged_at: Date.now() });

    // Gerar um novo token de autenticação para o estabelecimento
    const loginToken = jwt.sign({ _id: user._id }, AUTH_SECRET_KEY, { expiresIn: "1h" });

    // Responder com o novo token de autenticação
    res.status(200).json({ status: "success", token: loginToken });
  } catch (error) {
    console.error(`Error resetting password: ${error}`);
    res.status(500).json({ error: "There was an error resetting the password. Please try again later." });
  }
});


export default router;
