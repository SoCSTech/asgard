"use strict";
const nodemailer = require("nodemailer");
const showdown = require('showdown');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_USE_SSL,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

console.log(transporter)

// Creates a HTML email from a template
function formatMailTextAsHTML(rawText: string): string {
    rawText = rawText.replace(
        /((https?):\/\/[^\s]+)/g,
        '<a href="$1">$1</a>'
    );

    const sd = new showdown.Converter();
    sd.setOption('simplifiedAutoLink', true);
    const html = sd.makeHtml(rawText);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            color: #121212;
        }
        .email-content {
            border-radius: 12px;
            max-width: 600px;
            width: 100%;
        }
        .email-content p {
           padding: 0 40px;
        }
        .inner {
          padding-top: 10px;
          padding-bottom: 10px;
        }
        hr {
          width: 90%;
          height: 1px;
          background-color: #7ab4f5;
        }
        h1 {
            text-align: center;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="email-content">
        <h1>asgard<sup>2</sup></h1>
        <hr />
        <div class="inner">
          ${html}
        </div>
        <hr />
        <p class="footer" style="font-weight: bold; padding-top: 10px;">
            SoCS Technicians
        </p>
        <p class="footer" style="font-weight: bold">
            University of Lincoln
        </p>
        <p class="footer">
            Please reply to this email if you have any queries about this system.
        </p>
    </div>
</body>
</html>`
}

export async function SendEmail(to: string, subject: string, body: string) {
    const removeAsterisksPattern = /\*/gi // remove *s

    // This gets appended to a plain text email
    const plainEmailSignature = `

---
asgard2 by SoCS Technicians
University of Lincoln
*Please reply to this email if you have any queries about this system.*`

    try {
        // Sends email from the system
        const info = await transporter.sendMail({
            from: `"Asgard - Timetables and Bookings" <${process.env.MAIL_FROM}>`, // sender address
            replyTo: `${process.env.MAIL_REPLY}`,
            to: to,
            subject: subject,
            text: body.replace(removeAsterisksPattern, "") + plainEmailSignature,
            html: formatMailTextAsHTML(body),
        });

        // Logs out the msg id for debugging
        console.log("📫 Message sent: " + info.messageId);
        return { info: info, success: true }
    } catch (error) {
        console.warn("📭 Message failed to send: " + error);
        return { info: error, success: false }
    }
}

export async function SendPasswordResetEmail(to: string, name: string, code: string) {
    return await SendEmail(
        to,
        `Your account verification code is ${code}`,
        `Hi ${name}, 

Your Asgard password reset code is **${code}**.

You have 1 hour to change your password at: ${process.env.WEB_BASEURL}/change-password?code=${code}

If this wasn't you - please ignore this email.`)
}

export async function SendPasswordUpdatedEmail(to: string, name: string) {
    return await SendEmail(
        to,
        `Your account password has been updated`,
        `Hi ${name}, 

Your Asgard password has been updated.

If this wasn't you - please contact a technician urgently.`)
}

export async function SendWelcomeEmail(to: string, name: string, username: string) {
    return await SendEmail(
        to,
        `Welcome to Asgard`,
        `Hi ${name}, 

You have been invited to manage timetables and room bookings with the Asgard system.

The dashboard is located at ${process.env.WEB_BASEURL}

- Your Username: ${username}
- Your Email: ${to}

Before you can login you will need to reset your password.

If you have any further questions - please contact the technicians.`)
}