import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendEmailConfig = async (options) => {
    //Create trasport
    var transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
        }
    });
    try {
        const emailOptions =  {
            from: "Was Geth Ab support<wga-support-wgaaa@gmail.com>", ///process.env.SENDER_EMAIL, // Update with your sender email
            to: options.email,
            subject: options.subject,
            html: options.htmlContent,
        };

        return await transport.sendMail(emailOptions);
    } catch (error) {
        return new Error(error);
    }
};

export default sendEmailConfig;
