require("dotenv").config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, from, subject, html) => {
    const msg = {
        to: to,
        from: from,
        subject: subject,
        html: html,
    };
    await sgMail.send(msg);

};

module.exports = sendEmail;
