"use strict";

const nodemailer = require("nodemailer");
const showdown = require('showdown');
const dotenv = require('dotenv');
dotenv.config();

// Email interface to structure email objects
interface Email {
    to: string;
    subject: string;
    text: string;
    html?: string;
    attempts: number;
}

// Array to maintain the email queue
const emailQueue: Email[] = [];
const maxAttempts = 10;

// Define the interface for mail options
interface MailOptions {
    host: string | undefined;
    port: number | undefined;  // Adjust this to 'number' if MAIL_PORT is always a number
    secure: boolean;
    auth?: {
        user: string | undefined;
        pass: string | undefined;
    };
}

const mailOptions: MailOptions = {
    host: process.env.MAIL_SERVER,
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined, // Ensure this is a number
    secure: process.env.MAIL_USE_SSL === 'true', // Ensure this is a boolean
};

if (process.env.MAIL_USEAUTH === 'true') {
    mailOptions.auth = {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    };
}

const transporter = nodemailer.createTransport(mailOptions);

// Creates a HTML email from a template
function formatMailTextAsHTML(rawText: string): string {
    rawText = rawText.replace(
        /((https?):\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
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
            text-align: left;
            padding-top: 10px;
        }
        code {
            font-family: monospace;
            display: inline;
            position: relative;
            letter-spacing: 5px;
            background-clip: padding-box;
            text-shadow: 0 0 0.5px #000;
            box-shadow: 0 0 0 1px #000;
            padding: 5px;
            border-radius: 3px;
        }

        code::before,
        code::after {
            content: "";
            display: inline-block;
            width: 0;
        }

        code::before {
            margin-left: -2.5px;
        }

        code::after {
            margin-right: -2.5px;
        }
        .header {
            background-color: #fcc05f;
            border-radius: 12px 12px 0 0;
            margin-bottom: 5px;
            height: 60px;
        }
        .header h1 {
            color: #121212;
            padding: 10px;
        }
        .bottom {
            background-color: #fcc05f;
            border-radius: 0 0 12px 12px;
            margin-top: 15px;
            height: 30px;
        }
    </style>
</head>
<body>
    <div class="email-content">
        <div class="header">
            <h1>Asgard</h1>
        </div>
        <div class="inner">
          ${html}
        </div>
        <p class="footer">Thanks,</p>
        <p><span style="font-weight: bold;">Asgard</span>, University of Lincoln
        </p>
        <p class="footer" style="font-style: italic;">
            Please reply to this email if you have any queries about this system.
        </p>
        <div class="bottom"></div>
    </div>
</body>
</html>`
}

export async function SendEmail(to: string, subject: string, body: string) {
    const removeMarkdownPattern = /[*_~`]/gi; // remove *, _, ~, and ` characters

    // This gets appended to a plain text email
    const plainEmailSignature = `

---
Thanks,
Asgard Team
*Please reply to this email if you have any queries about using this system.*`;

    const email: Email = {
        to,
        subject,
        text: body.replace(removeMarkdownPattern, "") + plainEmailSignature,
        html: formatMailTextAsHTML(body),
        attempts: 0,
    };

    // Add email to the queue
    emailQueue.push(email);
    processQueue();
}

export async function SendPasswordResetEmail(to: string, name: string, code: string) {
    return await SendEmail(
        to,
        `Your account verification code is ${code}`,
        `Hi ${name}, 

Your password reset code for Asgard is:

\`${code}\`

You have **1 hour** to change your password at: ${process.env.WEB_BASEURL}/change-password?code=${code}


**If this wasn't you - please ignore this email and your password will not be changed.**`)
}

export async function SendPasswordUpdatedEmail(to: string, name: string) {
    return await SendEmail(
        to,
        `Your account password has been updated`,
        `Hi ${name}, 

Your Asgard password has been updated.

If this was you, you do not need to do anything, but, if this wasn't you - please reply to this email.`)
}

export async function SendWelcomeEmail(to: string, name: string, username: string) {
    return await SendEmail(
        to,
        `Welcome to Asgard`,
        `Hi ${name}, 

You have been invited to manage timetables, room bookings, signage, and other lab experience tools with the Asgard system.

The dashboard is located at ${process.env.WEB_BASEURL}

- Your Username: ${username}
- Your Email: ${to}

Before you can login you will need to reset your password.

If you have any further questions - please contact the technicians.`)
}

const processQueue = async (): Promise<void> => {
    while (emailQueue.length > 0) {
        const email = emailQueue.shift();
        if (email) {
            await attemptToSendEmail(email);
        }
    }
};

const attemptToSendEmail = async (email: Email): Promise<void> => {
    try {
        // Sends email from the system
        const info = await transporter.sendMail({
            from: `"Asgard" <${process.env.MAIL_FROM}>`, // sender address
            replyTo: `${process.env.MAIL_REPLY}`,
            to: email.to,
            subject: email.subject,
            text: email.text,
            html: email.html,
        });

        // Logs out the msg id for debugging
        console.log("📫 Message sent: " + info.messageId);
    } catch (error) {
        console.warn("📭 Message failed to send: " + error);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before trying again

        if (email.attempts < maxAttempts) {
            email.attempts += 1;
            emailQueue.push(email);
            console.log(`Requeued email to ${email.to}. Attempt ${email.attempts}`);
        } else {
            console.log(`Failed to send email to ${email.to} after ${maxAttempts} attempts.`);
        }
    }
};