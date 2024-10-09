import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

// Configure SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendGridConfig = async (receiver, source, subject, htmlContent) => {
  try {
    const msg = {
      to: receiver,
      from: source, // process.env.NO_REPLY_EMAIL, eu email
      subject: subject,
      html: htmlContent, // HTML body content
    };
    // Envia o email e recebe a resposta
   return await sgMail.send(msg); // SendGrid retorna um array

    // // Verifica se o status do envio foi 202
    // if (response.statusCode === 202) {
    //   console.log(
    //     `Email sent to ${options.email} successfully with status code: ${response.statusCode}`
    //   );
    // } else {
    //   console.error(
    //     `Failed to send email. Status code: ${response.statusCode}`
    //   );
    // }
  } catch (error) {
    // Exibe o erro detalhado no console
    console.error(
      `Error sending email: ${
        error.response ? error.response.body : error.message
      }`
    );
    throw new Error("Error sending email");
  }
};
export default sendGridConfig;
