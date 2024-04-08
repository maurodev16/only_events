import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config();


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailConfig = async (receiver, subject, htmlContent) => {
    try {
        const data = {
            to: receiver,
            from: "noreplay@wasgehtab.de",
            subject: subject,
            html: htmlContent,
        };

        return sgMail.send(data);
    } catch (error) {
        return new Error(error);
    }
};

export default sendEmailConfig;

