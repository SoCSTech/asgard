"use strict";
const nodemailer = require("nodemailer");
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

export async function SendEmail(to: string, subject: string, body: string) {
    const info = await transporter.sendMail({
        from: `"Asgard - Timetables and Bookings" <${process.env.MAIL_FROM}>`, // sender address
        replyTo: `${process.env.MAIL_REPLY}`,
        to: to,
        subject: subject,
        text: body,
        // html: "<b>Hello world?</b>", // html body
    });

    console.log("📫 Message sent: " + info.messageId);
}

export async function SendPasswordResetEmail(to: string, name: string, code: string) {
    await SendEmail(
        to, 
        `Your account verification code is ${code}`, 
        `Hi ${name}, 

Your Asgard password reset code is ${code}.
You have 1 hour to change your password at ${process.env.WEB_BASEURL}/change-password?code=${code}

If this wasn't you - please ignore this email.`)
}

export async function SendPasswordUpdatedEmail(to: string, name: string) {
    await SendEmail(
        to,
        `Your account password has been updated`,
        `Hi ${name}, 

Your Asgard password has been updated.
If this wasn't you - please contact a technician urgently.`)
}

export async function SendWelcomeEmail(to: string, name: string, username: string) {
    await SendEmail(
        to,
        `Welcome to Asgard`,
        `Hi ${name}, 

You have been invited to manage timetables and room bookings with the Asgard system.

The dashboard is located at ${process.env.WEB_BASEURL}

Your Username: ${username}
Your Email: ${to}

Before you can login you will need to reset your password.

If you have any further questions - please contact the technicians.`)
}