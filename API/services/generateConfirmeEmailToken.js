import crypto from 'crypto';
const generateConfirmeEmailToken = (user) => {
    // Gerar e salvar um token de redefinição de senha
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.verificationEmailToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const returnedToken = user.verificationEmailToken;
    // Definir o tempo de expiração do token (por exemplo, 10 minutos a partir de agora)
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationEmailTokenExpires = expirationDate.toISOString();
  
    // Salvar as alterações no usuário
    user.save();
  console.log(`Token::::${returnedToken}`)
    // Retornar o token
    return returnedToken;
  };
  
  export default generateConfirmeEmailToken;