import { Router } from "express";
import Establishment from "../../models/Establishment/Establishment.js";
import generateConfirmeEmailToken from '../../services/generateConfirmeEmailToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import dotenv from "dotenv";
const router = Router();
dotenv.config();

router.post('/send-email-verification', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verifique se o e-mail é válido
    if (!email) {
      return res.status(400).json({ error: "Email address is required!" });
    }

    // Encontre o estabelecimento pelo e-mail
    const establishment = await Establishment.findOne({ email });

    // Se não encontrar o estabelecimento, retorne um erro
    if (!establishment) {
      return res.status(404).json({ error: "No establishment found with this email!" });
    }

    // Gere e salve o token de verificação de e-mail
    const resetToken = generateConfirmeEmailToken(establishment);

    // Construa o link de verificação de e-mail
    const resetLink = `${req.protocol}://localhost:3000/api/v1/email-verification/verify-email/${resetToken}`;

    // Construa o conteúdo HTML do e-mail

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Email</title>
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
          <p>Verify your email.</p>
          <p>Please follow this link:</p>
          <a href="${resetLink}" target="_blank">Email Verification</a>
            <div class="footer">
            <p>This link is valid for 10 minutes.</p>

            </div>
          </div>
        </body>
        </html>
        
        `;
    // Envie o e-mail de verificação
    const isEmailSent = await sendEmailConfig({
      email: establishment.email,
      subject: "Email Verification received",
      htmlContent: htmlContent
    });

    // Se o e-mail não puder ser enviado, limpe o token de verificação
    if (!isEmailSent) {
      establishment.verificationEmailToken = undefined;
      await establishment.save();
      return res.status(500).json({ error: "Failed to send email verification!" });
    }

    // Responda com uma mensagem de sucesso
    return res.status(200).json({ message: "Email verification sent successfully!" });
  } catch (error) {
    // Se ocorrer algum erro durante o processo, retorne um erro 500
    console.error(`Error sending email verification: ${error}`);
    res.status(500).json({ error: "Error sending email verification. Please try again later." });
  }
});


router.patch('/verify-email/:token', async (req, res, next) => {
  try {
    // Extrair o token da URL
    const { token } = req.params;

    // Encontrar o estabelecimento com o token de verificação fornecido
    const establishment = await Establishment.findOne({ verificationEmailToken: token });

    // Se não encontrar o estabelecimento, retorne um erro
    if (!establishment) { 
      return res.render('email_verification_error');
    }

    
    // Verificar se o token está vencido
    const currentToken = Establishment.findOne({ verificationEmailTokenExpires: { $gt: Date.now() } });
    if (!currentToken) {
      return res.render('email_verification_error');
    }

    // Marcar o e-mail como verificado e limpar o token de verificação
    establishment.isEmailVerified = true;
    establishment.verificationEmailToken = undefined;
    await establishment.save();

    // Retornar sucesso e o novo token
    return res.render('email_verify_success');
  } catch (error) {
    // Se ocorrer algum erro durante o processo, retorne um erro 500
    console.error(`Error verifying email: ${error}`);
    res.status(500).json({ error: "Error verifying email. Please try again later." });
  }
});



router.get('/email-verification-result', (req, res) => {
  const { msg } = req.params;
  const resetLink = `${req.protocol}://localhost:3000/api/v1/email-verification/verify-email/${msg}`;
  res.render('email-verification-result', { resetLink });
});

export default router;
