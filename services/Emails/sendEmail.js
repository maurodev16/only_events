const nodemailer = require("nodemailer");
const handlebars= require("handlebars");
const fs = require("fs");
const path = require("path");


const sendEmail = async (email, subject, payload, template)=>{
    try {
        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            service: process.env.EMAIL_SERVICE,
            port:465,
            secure:true,
            auth:{
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

const source = fs.readFileSync(path.join(__dirname, template), "utf8");
const compiledTemplate = handlebars.compile(source);
const options = () => {
    return {
        from: process.env.FROM_EMAIL,
        to:email,
        subject: subject,
        html:compiledTemplate(payload),
    };
};

// Send email
transport.sendMail(options(), (error, info)=>{
    if (error) {
        return error;
    } else {
        console.log("email sent sucessfully");
        return res.status(200).json({ success: true });
    }
});

    } catch (error) {
        console.log(error, "email not sent", error);
        return error;
    }
};

module.exports = sendEmail;