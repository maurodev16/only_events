import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

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

export default sendEmail;
