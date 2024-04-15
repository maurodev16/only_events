import User from '../../models/User.js';
import Establishment from '../../models/Establishment/Establishment.js';
import { Router } from 'express';
import checkToken from '../../middleware/checkToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import crypto from 'crypto'; // Importe o módulo 'crypto' para usar a função de hash
import generateResetPasswordToken from '../../services/generateResetPasswordToken.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import signInFromJwt from '../../controllers/AuthController.js';

// Obtenha o diretório atual do arquivo
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const bcryptSalt = process.env.BCRYPT_SALT;
const router = Router();
///- Router to send reset link to user email

router.post('/send-link-reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find establishment by email
    const establishment = await Establishment.findOne({ email });
    if (!establishment) {
      return res.status(404).json({ error: "No establishment found with this email!" });
    }

    // Generate and save a password reset token
    const resetToken = generateResetPasswordToken(establishment);

    // Check if reset token was generated successfully
    if (!resetToken) {
      return res.status(500).json({ error: "Failed to generate password reset token." });
    }

    // Construct reset link
    const resetLink = `${process.env.API_URL}/api/v1/estab-request/reset-password/${resetToken}`;

    // Construct HTML content for the email
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
    const isEmailSend = await sendEmailConfig({ 
      email: establishment.email, 
      subject: "Password change request received", 
      htmlContent: htmlContent 
    });
    if (!isEmailSend) {
      establishment.passwordResetToken = undefined;
      establishment.passwordResetTokenExpires = undefined;
      
    }

    // Save establishment after all operations are completed
    await establishment.save({ validateBeforeSave: false });

    // Return success message
    return res.status(200).json({ status: true, msg: `Password reset link has been successfully sent to email ${email}` });
  } catch (error) {
    console.error(`Error sending reset link: ${error}`);
    res.status(500).json({ error: "There was an error sending the password reset email. Please try again later." });
  }
});


router.patch("/reset-password/:token", async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    // Verificar se o token é válido e se não expirou
    const establishment = await Establishment.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

    if (!establishment) {
      // Se o estabelecimento não for encontrado ou o token expirar, enviar erro 401
      return res.status(401).json({ error: "Token is invalid or has expired!" });
    }

    // Resetar a senha do estabelecimento
    establishment.password = newPassword;
    establishment.passwordResetToken = undefined;
    establishment.passwordResetTokenExpires = undefined;
    establishment.passwordChangedAt = Date.now();
    await establishment.save();

    // Fazer login do estabelecimento e gerar um novo token
    const loginToken = signInFromJwt(establishment._id);

    // Retornar sucesso e o novo token
    return res.status(200).json({ status: true, token: loginToken });
  } catch (error) {
    console.error(`Error resetting password: ${error}`);
    res.status(500).json({ error: "There was an error resetting the password." });
  }
});


export default router;

//     // Construir o formulário de redefinição de senha diretamente no código
//     const resetPasswordForm = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Password Reset</title>
//       <!-- Adicionar Bootstrap CSS -->
//       <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
//     </head>
//     <body>
//       <div class="container mt-5">
//         <h1 class="text-center mb-4">Password Reset</h1>
//         <form id="reset-form">
//           <div class="form-group">
//             <label for="new-password">New Password:</label>
//             <input type="password" class="form-control" id="new-password" name="new-password" required>
//           </div>
//           <div class="form-group">
//             <label for="confirm-password">Confirm Password:</label>
//             <input type="password" class="form-control" id="confirm-password" name="confirm-password" required>
//           </div>
//           <button type="button" class="btn btn-primary btn-block" onclick="resetPassword()">Reset Password</button>
//           <p id="reset-message" class="text-danger mt-2"></p>
//         </form>
//       </div>
    
//       <!-- Adicionar Bootstrap JS (opcional, apenas necessário para alguns componentes) -->
//       <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    
//       <script>
//         function resetPassword() {
//           var newPassword = document.getElementById("new-password").value;
//           var confirmPassword = document.getElementById("confirm-password").value;
    
//           // Verificar se as senhas são iguais
//           if (newPassword !== confirmPassword) {
//             document.getElementById("reset-message").innerText = "Passwords do not match";
//             return;
//           }
    
//           // Aqui você pode adicionar o código para enviar os dados do formulário para o servidor
//           // Exemplo: fazer uma requisição AJAX para a rota de reset de senha
//           // var xhr = new XMLHttpRequest();
//           // xhr.open("POST", "/reset-password", true);
//           // xhr.setRequestHeader("Content-Type", "application/json");
//           // var data = JSON.stringify({ newPassword: newPassword, token: "${token}" });
//           // xhr.send(data);
          
//           // Exemplo de mensagem de sucesso
//           document.getElementById("reset-message").innerText = "Password reset successfully!";
//         }
//       </script>
//     </body>
//     </html>
    
    
//     `;