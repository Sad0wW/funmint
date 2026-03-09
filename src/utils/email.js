const nodemailer = require("nodemailer");
const { env } = require("./storage.js");

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    secure: true,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD
    },
});

module.exports.sendEmail = async (to, subject, text, html) => {
    await transporter.sendMail({
        from: `"FunMint" <${env.EMAIL_NOREPLY}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
    });
};