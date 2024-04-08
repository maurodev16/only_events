import User from '../../models/User.js';
import Establishment from '../../models/Establishment/Establishment.js';
import { Router } from 'express';
import checkToken from '../../middleware/checkToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import TokenEstab from '../../models/TokenEstab.js'; // Importe o modelo TokenEstab
import crypto from 'crypto'; // Importe o módulo 'crypto' para usar a função de hash
import  generateResetToken from '../../services/generateResetToken.js';

const router = Router();

///- Router to send reset link to user email
router.post('/send-link-reset-password', async (req, res) => {
  try {
    const { email } = req.body;

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

    const resetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/request-reset-password/${resetToken}`;
    console.log(resetLink);

    // Enviar e-mail com link de redefinição de senha
   const sendEmail= await sendEmailConfig(email, "Password change request received", resetLink);
    console.log(sendEmail);

    return res.status(200).json({ msg: "Password reset link has been successfully sent to your email" });
  } catch (error) {
    console.error(`Error sending reset link: ${error}`);
    console.error('Error sending email:', error.response?.body?.errors);
    res.status(500).json({ error: "There was an error sending password reset email. Please try again later.", emailError: error.message });
  }
});


//-- Router to Reset user Password
router.patch("/request-reset-password/:token", async (req, res) => {
    try {
        const newPassword = req.body;
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

        // Atualizar a senha do estabelecimento
        establishment.password = newPassword;
        establishment.passwordChanged_at = Date.now();

        // Limpar o token de redefinição de senha do estabelecimento
        await tokenEstab.remove();

        // Salvar as alterações no estabelecimento
        await establishment.save();

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
