const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.BREVO_EMAIL,
        pass: process.env.BREVO_KEY
    }
});

module.exports = transporter;