import { Router } from "express";
import generateConfirmeEmailToken from '../../services/generateConfirmeEmailToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import crypto from 'crypto'; // Importe o módulo 'crypto' para usar a função de hash
import dotenv from "dotenv";
const router = Router();
dotenv.config();

router.post('/send-email-verification-link', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verifique se o e-mail é válido
    if (!email) {
      return res.status(400).json({ error: "Email address is required!" });
    }

    // Encontre o companyelecimento pelo e-mail
    const company = await Company.findOne({ email });

    // Se não encontrar o companyelecimento, retorne um erro
    if (!company) {
      return res.status(404).json({ error: "No company found with this email!" });
    }

    // Gere e salve o token de verificação de e-mail
    const resetToken = generateConfirmeEmailToken(company);

    // Construa o link de verificação de e-mail
    const resetLink = `${process.env.API_URL}/api/v1/email-verification/confirm-email/${resetToken}`;
console.log(resetLink)
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
      email: company.email,
      subject: "Email Verification received",
      htmlContent: htmlContent,
    });

    // Se o e-mail não puder ser enviado, limpe o token de verificação
    if (!isEmailSent) {
      company.verificationEmailToken = undefined;
      company.verificationEmailTokenExpires = undefined;
      company.isEmailVerified = false;
    }
    await company.save({ validateBeforeSave: false });
    // Responda com uma mensagem de sucesso
    return res.status(200).json({ message: "Email verification sent successfully!" });
  } catch (error) {
    // Se ocorrer algum erro durante o processo, retorne um erro 500
    console.error(`Error sending email verification: ${error}`);
    res.status(500).json({ error: "Error sending email verification. Please try again later." });
  }
});


router.patch('/confirm-email/:token', async (req, res, next) => {
  try {
    // Extrair o token da URL
    const token = req.params.token;

    // Encontrar o companyelecimento com base no token de verificação fornecido
    const company = await Company.findOne({
      verificationEmailToken: token,
      verificationEmailTokenExpires: { $gt: Date.now() },
    });

    // Verificar se o companyelecimento foi encontrado
    if (!company) {
      // Se o companyelecimento não for encontrado ou o token expirar, enviar erro 401
      return res.status(401).json({ error: "Token is invalid or has expired!" });
    }

    // Marcar o e-mail como verificado e limpar o token de verificação
    company.isEmailVerified = true;
    company.verificationEmailToken = undefined;
    company.verificationEmailTokenExpires = undefined;
    await company.save();

    // Retornar sucesso e o novo token
    return res.status(200).json({ status: true });
  } catch (error) {
    // Se ocorrer algum erro durante o processo, retorne um erro 500
    console.error(`Error verifying email: ${error}`);
    res.status(500).json({ error: "Error verifying email. Please try again later." });
  }
});

//-- Only for the app verification
router.get('/email-verification-result/:id', async (req, res) => {
  try {
    const companyId = req.params.id;

    // Encontrar o companyelecimento com base no ID fornecido
    const company = await Company.findById(companyId);

    if (!company) {
      // Se o companyelecimento não for encontrado, retorne um erro
      return res.status(404).json({ error: "Company not found" });
    }

    // Verifique se o e-mail foi verificado com sucesso
    if (company.isEmailVerified) {
      return res.status(200).json({ status: true, message: "Email successfully verified" });
    } else {
      return res.status(200).json({ status: false, message: "Email not verified" });
    }
  } catch (error) {
    console.error(`Error getting email verification result: ${error}`);
    res.status(500).json({ error: "Error getting email verification result" });
  }
});


export default router;
