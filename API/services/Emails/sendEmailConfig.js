import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import handlebars from 'handlebars';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailConfig = async (receiver, subject, resetLink) => {
    try {
        // Read the content of the resetPassword.handlebars file
        const source = fs.readFileSync('resetPassword.handlebars', 'utf8');

        // Compile the handlebars template
        const template = handlebars.compile(source);

        // Define the email content by passing resetLink to the compiled template
        const html = template({ resetLink });

        const data = {
            to: receiver,
            from: process.env.SENDER_EMAIL, // Update with your sender email
            subject: subject,
            html: html,
        };
console.log(data)
        return sgMail.send(data);
    } catch (error) {
        return new Error(error);
    }
};

export default sendEmailConfig;
