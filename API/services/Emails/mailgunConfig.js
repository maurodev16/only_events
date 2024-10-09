import formData from 'form-data'
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,

});

const sendEmailGunConfig = async (to, subject, text, html) => {
  mg.messages
    .create('', {
      from: process.env.NO_REPLAY_EMAIL,
      to: to,
      subject: subject,
      text: text,
      html: html,
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(err)); // logs any error
};

export default sendEmailGunConfig;
