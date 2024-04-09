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
    const { email } = await req.body;

    // Validate establishment data
    if (!email) {
      console.log(email);

      return res.status(401).json({ error: "Please provide a valid email!" });
    }


    let establishment;

    // Check if Email is an email using regular expression
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmail) {
      establishment = await Establishment.findOne({ email: email });
      console.log(email);
    } else {
      // Find establishment using email
      establishment = await Establishment.findOne({
        email: { $regex: `^${email}`, $options: "i" },
      });
      console.log(establishment);
    }

    if (!establishment) {
      return res.status(404).json({ error: "No establishment found with this email!" });
    }

    console.log(establishment);

    // Gerar e salvar um token de redefinição de senha
    const resetToken = generateResetToken(establishment);
    console.log(resetToken);
    // Salvar o token no banco de dados usando o modelo TokenEstab
    await TokenEstab.create({ establishmentId: establishment._id, token: resetToken });

    const resetLink = `${req.protocol}://localhost:3000/api/v1/estab-request/request-reset-password/${resetToken}`;
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
      background-color: #f4f4f4;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
      padding: 10px 20px;
      background-color: #007bff;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s ease;
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
    <p>Du bekommst diese E-Mail, weil du ein neues Passwort angefordet hast.</p></br>
    <p>Bitte folge diesem Button, um ein neues Passwort zu vergeben.</p></br>
    <a href="${resetLink}" target="_blank">Neus Passwort vergeben</a></br>
    <div class="footer">
      <p>Dieser Link is 10 Minuten gültig.</p>
    </div>
  </div>
</body>
</html>
    `;


    console.log(resetLink);

    // Enviar e-mail com link de redefinição de senha
    const sendEmail =
      await sendEmailConfig(email, "Password change request received", htmlContent);
    console.log(sendEmail);

    return res.status(200).json({ msg: "Password reset link has been successfully sent to your email" });
  } catch (error) {
    console.error(`Error sending reset link: ${error}`);
    console.error('Error sending email:', error.response?.body?.errors);
    res.status(500).json({ error: "There was an error sending password reset email. Please try again later.", emailError: error.message });
  }
});


//-- Router to Reset user Password

router.post("/request-reset-password/:token", async (req, res) => {
  try {
    const { newPassword } = await req.body;
    const token = req.params.token;

    // Buscar o token no banco de dados
    const tokenEstab = await TokenEstab.findOne({ token, createdAt: { $gt: Date.now() - 10 * 60 * 1000 } });

    if (!tokenEstab) {
      return res.status(401).json({ msg: "Token is invalid or has expired!" });
    }

    // Encontrar o estabelecimento associado ao token
    const establishment = await Establishment.findById(tokenEstab.establishmentId);

    if (!establishment) {
      return res.status(404).json({ msg: "Establishment not found!" });
    }

    // Gerar um hash seguro da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Limpar o token de redefinição de senha do estabelecimento
    await TokenEstab.deleteOne({ _id: tokenEstab._id });

    // Atualizar a senha do estabelecimento com o hash
    await Establishment.updateOne({ _id: establishment._id }, { password: hashedPassword, passwordChanged_at: Date.now() });

    // Gerar um novo token de autenticação para o estabelecimento
    const loginToken = jwt.sign({ _id: establishment._id }, AUTH_SECRET_KEY, { expiresIn: "1h" });

    // Responder com o novo token de autenticação
    res.status(200).json({ status: "success", token: loginToken });
  } catch (error) {
    console.error(`Error resetting password: ${error}`);
    res.status(500).json({ error: "There was an error resetting the password. Please try again later." });
  }
});


export default router;
