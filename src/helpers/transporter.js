const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "hilmawanzaky57@gmail.com", // generated ethereal user
        pass: process.env.ETH_PASS, // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter