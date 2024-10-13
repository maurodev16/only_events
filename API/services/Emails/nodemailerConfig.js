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
      console.log(`Email successfully sent to: ${info.accepted.join(', ')}`);
      return {
        success: true,
        message: `Email successfully sent to: ${info.accepted.join(', ')}`
      };
    } else if (info.rejected.length > 0) {
      console.error(`Failed to send email to: ${info.rejected.join(', ')}`);
      return {
        success: false,
        message: `Failed to send email to: ${info.rejected.join(', ')}`
      };
    } else {
      console.error("The email was sent, but there is no confirmation of acceptance.");
      return {
        success: false,
        message: "The email was sent, but there is no confirmation of acceptance."
      };
    }

  } catch (error) {
    console.error(`Erro ao enviar o e-mail: ${error}`);
    return {
      success: false,
      message: `Error sending email: ${error.message}`
    };
  }
};

export default nodemailerConfig;
