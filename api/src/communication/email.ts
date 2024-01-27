const dotenv = require('dotenv');
dotenv.config();

export function SendEmail(to: string, subject: string, body: string) {
    console.log(`Email to ${to}, "${subject}"\n-\n${body}`)
}

export function SendPasswordResetEmail(to: string, name: string, code: string) {
    SendEmail(
        to, 
        `Your account verification code is ${code}`, 
        `Hi ${name}, 

Your Asgard password reset code is ${code}. 

You have 1 hour to enter this code at ${process.env.WEB_BASEURL}/change-password?code=${code}

If this wasn't you - please ignore this email.`)
}