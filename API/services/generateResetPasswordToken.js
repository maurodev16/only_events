import crypto from 'crypto';

const generateResetPasswordToken = (user) => {
  // Gerar e salvar um token de redefinição de senha
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Definir o tempo de expiração do token (por exemplo, 10 minutos a partir de agora)
  const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetTokenExpires = expirationDate.toISOString();

  // Salvar as alterações no usuário
  user.save();
console.log(resetToken,user.passwordResetToken )
  // Retornar o token
  return resetToken;
};

export default generateResetPasswordToken;



