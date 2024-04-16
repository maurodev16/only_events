import crypto from 'crypto';

const generateConfirmeEmailToken = (user) => {
  // Gerar um token de verificação de e-mail aleatório
  const token = crypto.randomBytes(32).toString('hex');

  // Definir o token de verificação de e-mail e sua data de expiração
  user.verificationEmailToken = token;
  const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos a partir de agora
  user.verificationEmailTokenExpires = expirationDate;

  // Salvar as alterações no usuário
  user.save();

  // Retornar o token gerado
  return token;
};

export default generateConfirmeEmailToken;
