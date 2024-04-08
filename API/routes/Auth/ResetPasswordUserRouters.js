import User from '../../models/User.js';
import Establishment from '../../models/Establishment/Establishment.js';
import { Router } from 'express';
import checkToken from '../../middleware/checkToken.js';
import sendEmailConfig from "../../services/Emails/sendEmailConfig.js";
import TokenUser from '../../models/TokenUser.js';
import  generateResetToken from '../../services/generateResetToken.js';

const router = Router();

///- Router to send reset link to user email
router.post("/send-link-reset-password", async (req, res) => {
  try {
    //1. GET USER BASED ON POSTED EMAIL
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "We could not find the user with the given email." });
    }

    // Gerar e salvar um token de redefinição de senha
    const resetToken = generateResetToken(user);

    const resetLink = `${req.protocol}://${req.get('host')}/api/v1/auth/request-reset-password/${resetToken}`;

    console.log(resetToken, user.passwordResetToken);

    // Agora você pode enviar o e-mail com o link de redefinição de senha usando a função sendEmailConfig
    // Certifique-se de passar o e-mail do usuário, o link de redefinição e o assunto para a função
    await sendEmailConfig(email, "Password change request received", resetLink);

    return res.status(200).json({ msg: "Password reset link has been successfully sent to your email" });
  } catch (error) {
    console.error('Error sending email:', error.response?.body?.errors);
    res.status(500).json({ error: "There was an error sending password reset email. Please try again later.", emailError: error.message });
  }
});


router.patch("/request-reset-password/:token", async (req, res) => {

  const newPassword = req.body;

  const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
  // Buscar o token no banco de dados
  const user = await User.findOne({ passwordResetToken: token, passwordResetToken_expires: { $gt: Date.now() } });

  if (!user) {
    return res.status(401).json({ msg: "Token is invalid or has expired!" });
  }
  //2 RESTTING THE USER PASSWORD
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetToken_expires = undefined;
  user.passwordChanged_at = Date.now();
  user.save();

  //3 LOGIN THE USER
  const loginToken = jwt.sign({ _id: user._id, }, AUTH_SECRET_KEY, { expiresIn: "1h", });
  res.status(200).json({ status: "success", token: loginToken });
});


export default router;