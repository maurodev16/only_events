import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailConfig = async (receiver, subject, htmlContent) => {
    try {

        // Define the email content by passing resetLink to the compiled template
        const html = template({ resetLink });

        const data = {
            to: receiver,
            from: process.env.SENDER_EMAIL, // Update with your sender email
            subject: subject,
            html: htmlContent,
        };
console
        return sgMail.send(data);
    } catch (error) {
        return new Error(error);
    }
};

export default sendEmailConfig;
