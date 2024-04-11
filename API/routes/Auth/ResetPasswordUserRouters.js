import User from '../../models/User.js';
import { Router } from 'express';
import checkToken from '../../middleware/checkToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
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


// Rota para renderizar o formulário de redefinição de senha
router.get("/reset-password/:token", async (req, res, next) => {
  try {
    // 1 - IF THE USER EXISTS WITH THE GIVEN TOKEN AND TOKEN HAS NOT EXPIRED
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

    if (!user) {
      const error = res.status(401).json({ error: "Token is invalid or has expired!" });
      next(error);
    }
    // 2- RESET THE USER PASSWORD
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    // Construct reset link
    const resetLink = `${req.protocol}://localhost:3000/api/v1/estab-request/reset-password`;
    // Construir o formulário de redefinição de senha diretamente no código
    const resetPasswordForm = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <!-- Adicionar Bootstrap CSS -->
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="text-center mb-4">Password Reset</h1>
        <form id="reset-form">
          <div class="form-group">
            <label for="new-password">New Password:</label>
            <input type="password" class="form-control" id="new-password" name="new-password" required>
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password:</label>
            <input type="password" class="form-control" id="confirm-password" name="confirm-password" required>
          </div>
          <button type="button" class="btn btn-primary btn-block" onclick="resetPassword()">Reset Password</button>
          <p id="reset-message" class="text-danger mt-2"></p>
        </form>
      </div>
    
      <!-- Adicionar Bootstrap JS (opcional, apenas necessário para alguns componentes) -->
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    
      <script>
        function resetPassword() {
          var newPassword = document.getElementById("new-password").value;
          var confirmPassword = document.getElementById("confirm-password").value;
    
          // Verificar se as senhas são iguais
          if (newPassword !== confirmPassword) {
            document.getElementById("reset-message").innerText = "Passwords do not match";
            return;
          }
    
          // Aqui você pode adicionar o código para enviar os dados do formulário para o servidor
          // Exemplo: fazer uma requisição AJAX para a rota de reset de senha
          // var xhr = new XMLHttpRequest();
          // xhr.open("POST", "/reset-password", true);
          // xhr.setRequestHeader("Content-Type", "application/json");
          // var data = JSON.stringify({ newPassword: newPassword, token: "${token}" });
          // xhr.send(data);
          
          // Exemplo de mensagem de sucesso
          document.getElementById("reset-message").innerText = "Password reset successfully!";
        }
      </script>
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


export default router;
