const dotenv = require("dotenv");
dotenv.config();
var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

function sendEmail({
    from = process.env.EMAIL,
    to = null,
    subject = "Sending Email using Node.js",
    html = "<h1>That was easy!</h1>",
} = {}) {
    transporter.sendMail(
        (mailOptions = { from: from, to: to, subject: subject, html: html }),
        function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        }
    );
}

exports.sendEmail = sendEmail;
