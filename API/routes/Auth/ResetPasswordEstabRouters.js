import User from '../../models/User.js';
import Establishment from '../../models/Establishment/Establishment.js';
import { Router } from 'express';
import checkToken from '../../middleware/checkToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import TokenEstab from '../../models/TokenEstab.js'; // Importe o modelo TokenEstab
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

    // Find establishment by email
    const establishment = await Establishment.findOne({ email });
    if (!establishment) {
      return res.status(404).json({ error: "No establishment found with this email!" });
    }

    // Generate and save a password reset token
    const resetToken = generateResetToken(establishment);

    // Check if reset token was generated successfully
    if (!resetToken) {
      return res.status(500).json({ error: "Failed to generate password reset token." });
    }

    await TokenEstab.create({ establishmentId: establishment._id, token: resetToken });

    // Construct reset link
    const resetLink = `https://wasgehtab.cyclic.app/api/v1/estab-request/reset-password/${resetToken}`;
    
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
        body {
          font-family: 'Arial', sans-serif;
          background-image: url('https://example.com/background-image.jpg'); /* Substitua pelo URL da sua imagem de fundo */
          background-size: cover;
          background-position: center;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        h2 {
          color: #007bff;
        }
        p {
          line-height: 1.6;
        }
        a {
          display: inline-block;
          padding: 15px 30px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 25px;
          transition: background-color 0.3s ease;
          font-size: 18px;
          margin-top: 20px;
        }
        a:hover {
          background-color: #0056b3;
        }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset</h2>
        <p>Dein neues Passwort.</p>
        <p>Du bekommst diese E-Mail, weil du ein neues Passwort angefordet hast.</p>
        <p>Bitte folge diesem Button, um ein neues Passwort zu vergeben.</p>
        <a href="${resetLink}" target="_blank">Neus Passwort vergeben</a>
        <div class="footer">
          <p>Dieser Link is 10 Minuten gültig.</p>
        </div>
      </div>
    </body>
    </html>
    
    `;

    // Send email with password reset link
    await sendEmailConfig(email, "Password change request received", htmlContent);

    // Return success message
    return res.status(200).json({ msg: "Password reset link has been successfully sent to your email" });
  } catch (error) {
    console.error(`Error sending reset link: ${error}`);
    res.status(500).json({ error: "There was an error sending the password reset email. Please try again later." });
  }
});


// Rota para renderizar o formulário de redefinição de senha
// Rota para renderizar o formulário de redefinição de senha
router.get("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Verificar se o token é válido
    const tokenEstab = await TokenEstab.findOne({ token, createdAt: { $gt: Date.now() - 10 * 60 * 1000 } });

    if (!tokenEstab) {
      return res.status(401).json({ msg: "Token is invalid or has expired!" });
    }
 // Construct reset link
 const resetLink = `https://wasgehtab.cyclic.app/api/v1/estab-request/reset-password`;
    // Construir o formulário de redefinição de senha diretamente no código
    const resetPasswordForm = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body>
        <h1>Password Reset</h1>
        <form action="${resetLink}" method="post">
          <input type="hidden" name="token" value="${token}">
          <label for="newPassword">New Password:</label>
          <input type="password" id="newPassword" name="newPassword" required>
          <button type="submit">Reset Password</button>
        </form>
      </body>
      </html>
    `;

    // Enviar o formulário de redefinição de senha como resposta
    res.send(resetPasswordForm);
  } catch (error) {
    console.error(`Error rendering password reset form: ${error}`);
    res.status(500).json({ error: "There was an error rendering the password reset form." });
  }
});


//-- Router to Reset user Password

// Rota para lidar com o envio do formulário de redefinição de senha
router.post("/reset-password", async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    // Buscar o token no banco de dados
    const tokenEstab = await TokenEstab.findOne({ token });

    if (!tokenEstab) {
      return res.status(401).json({ msg: "Token is invalid!" });
    }

    // Gerar um hash seguro da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Limpar o token de redefinição de senha do estabelecimento
    await TokenEstab.deleteOne({ _id: tokenEstab._id });

    // Atualizar a senha do estabelecimento com o hash
    await Establishment.updateOne({ _id: tokenEstab.establishmentId }, { password: hashedPassword, passwordChanged_at: Date.now() });

    // Responder com uma mensagem de sucesso
    res.status(200).json({ status: "success", msg: "Password reset successfully!" });
  } catch (error) {
    console.error(`Error resetting password: ${error}`);
    res.status(500).json({ error: "There was an error resetting the password. Please try again later." });
  }
});


export default router;
