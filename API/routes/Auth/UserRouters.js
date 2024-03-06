import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";
const router = Router();

import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import checkToken from "../../middleware/checkToken.js";
import checkRequiredFields from "../../middleware/errorHandler.js"
import mongoose from "mongoose";
import sendEmail from "../../services/Emails/sendEmail.js";
import Token from "../../models/Token.js";
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const BCRYPT_SALT = process.env.BCRYPT_SALT;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

/// Signup
router.post("/signup-user", checkRequiredFields(['nickname', 'email', 'password']), async (req, res) => {
  const { nickname, email, password } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Iniciar transação

    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(422).json({ error: 'EmailAlreadyExistsException' });
    }

    const user = new User({
      nickname: nickname,
      email: email,
      password: password,
    });

    const newCreatedUser = await user.save({ session });
    console.log(newCreatedUser);

    if (!newCreatedUser) {
      return res.status(500).json({ error: 'ErroSignupOnDatabaseException' });
    }

    await session.commitTransaction(); // Confirm Transaction
    session.endSession(); // End seccion
    const createdUser = await User.findById(newCreatedUser._id).select('-password');

    return res.status(201).json({ createdUser });
  } catch (error) {
    await session.abortTransaction(); // Rollback da Transaction
    session.endSession(); // End Section
    console.error(`Erro ao registrar: ${error}`);
    return res.status(500).json({ error: 'Error registering user' });
  }
});

/// Login route
router.post("/login-user", async (req, res) => {
  try {
    const { email, password } = await req.body;

    // Validate User data
    if (!email) {
      console.log(email);

      return res.status(401).json({ error: "Please provide a valid email!" });
    }

    let user;

    // Check if Email is an email using regular expression
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (isEmail) {
      user = await User.findOne({ email: email });
      console.log(email);
    } else {
      // Find user using email
      user = await User.findOne({
        email: { $regex: `^${email}`, $options: "i" },
      });
      console.log(user);
    }

    if (!user) {
      return res.status(404).json({ error: "No User found with this email!" });
    }

    if (!password) {
      return res.status(422).json({ error: "Password is required!" });
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json({ error: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id, }, AUTH_SECRET_KEY, { expiresIn: "1h", });
    user.token = token;
    const logedUser = await User.findById(user._id).select('-password').select('-__v');
    // Return the authentication token, ID, and email
    return res
      .status(200).json({ login: logedUser });
  } catch (error) {
    console.error(`Erro no login: ${error}`);
    res.status(500).json({ error: 'Erro no login' });
  }
});

router.post("/send-link-reset-password", async (req, res) => {
  //1. GET USER BASED ON POSTED EMAIL
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ error: "We could not find the user with the given email." });
  }

  // Gerar e salvar um token de redefinição de senha
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Definir o tempo de expiração do token (por exemplo, 10 minutos a partir de agora)
  const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetTokenExpires = expirationDate.toISOString();
  console.log(resetToken, user.passwordResetToken);

  // Salvar as alterações no usuário
  user.save({ validateBeforeSave: false })
  // Enviar e-mail com o link de redefinição de senha
  const resetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/request-reset-password/${resetToken}`;
  // // Lê o conteúdo do arquivo HTML como uma string
  // const templatePath = path.join(__dirname, 'services', 'Emails', 'Template', 'requestResetPassword.handlebars');
  // const templateSource = fs.readFileSync(templatePath, 'utf8');

  // // Compila o template Handlebars
  // const template = handlebars.compile(templateSource);

  // // Preenche o template com os dados necessários
  // const html = template({ resetLink: resetLink });

  try {
    await sendEmail(
      email,
      process.env.NO_REPLAY_EMAIL,
      "Password change request received",
      `
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
      </html>`
    );

    res.status(200).json({ msg: "Password reset link has been successfully sent to your email" });
  } catch (error) {
    user.passwordResetTokenExpires = undefined;

    console.error('Error sending email:', error.response?.body?.errors);
    res.status(500).json({ error: "There was an error sending password reset email. Please try again later.", emailError: error.message });
  }

});


router.patch("/request-reset-password/:token", async (req, res) => {

  const newPassword = req.body;


  const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
  // Buscar o token no banco de dados
  const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(401).json({ msg: "Token is invalid or has expired!" });
  }
  //2 RESTTING THE USER PASSWORD
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  user.save();

  //3 LOGIN THE USER
  const loginToken = jwt.sign({ _id: user._id, }, AUTH_SECRET_KEY, { expiresIn: "1h", });
  res.status(200).json({ status: "success", token: loginToken });
});

export default router;
