import nodemailer from "nodemailer";

const nodemailerConfig = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Porta TLS
    secure: true, // true para 465, false para 587
    auth: {
      user: process.env.GEMAIL_EMAIL, // Seu e-mail
      pass: process.env.GMAIL_PASS, // App Password ou sua senha
    },
  });

  try {
    // Enviando o e-mail
    const info = await transporter.sendMail({
      from: process.env.NO_REPLY_EMAIL, // Endereço do remetente
      to: to, // Destinatário
      subject: subject, // Assunto do e-mail
      html: html, // Conteúdo HTML do e-mail
    });

    // Verificando se o e-mail foi aceito ou rejeitado
    if (info.accepted.length > 0) {
      console.log(`E-mail enviado com sucesso para: ${info.accepted.join(', ')}`);
      return {
        success: true,
        message: `E-mail enviado com sucesso para: ${info.accepted.join(', ')}`
      };
    } else if (info.rejected.length > 0) {
      console.error(`Falha ao enviar e-mail para: ${info.rejected.join(', ')}`);
      return {
        success: false,
        message: `Falha ao enviar e-mail para: ${info.rejected.join(', ')}`
      };
    } else {
      console.error("O e-mail foi enviado, mas não há confirmação de aceitação.");
      return {
        success: false,
        message: "O e-mail foi enviado, mas não há confirmação de aceitação."
      };
    }

  } catch (error) {
    console.error(`Erro ao enviar o e-mail: ${error}`);
    return {
      success: false,
      message: `Erro ao enviar o e-mail: ${error.message}`
    };
  }
};

export default nodemailerConfig;
