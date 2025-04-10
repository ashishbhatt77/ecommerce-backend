const nodemailer = require("nodemailer");

const sendNotification = async (email, message) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Order Update",
            text: message
        });
    } catch (error) {
        console.error("Notification Error:", error);
    }
};

module.exports = sendNotification;