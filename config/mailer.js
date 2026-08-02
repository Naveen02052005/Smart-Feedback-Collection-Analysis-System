const axios = require("axios");


async function sendEmail(to, subject, html) {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Smart Feedback System",
                    email: process.env.BREVO_SENDER
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                }
            }
        );

        console.log("Email Sent:", response.data);
        return response.data;

    } catch (err) {
        console.log("Brevo Error:", err.response?.data || err.message);
        throw err;
    }
}

module.exports = sendEmail;