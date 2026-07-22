require("dotenv").config();

const transporter = require("./config/mailer");

async function test() {
    try {
        const info = await transporter.sendMail({
            from: "smartfeedback2@gmail.com",
            to: "merugunaveen171@gmail.com",   // <-- put a valid email here
            subject: "Brevo Test",
            text: "Hello from Brevo"
        });

        console.log(info);

    } catch (err) {
        console.log(err);
    }
}

test();