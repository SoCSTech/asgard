import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { users as userSchema } from '@/db/schema';
import { eq, and, or, gt } from 'drizzle-orm';
import { hashPassword, comparePassword } from '@/utils/passwords';
import * as email from '@/communication/email';
import { generateSecureCode, verifyTOTP } from "@/utils/auth";
import { log } from "@/utils/log";
import { verify } from "crypto";
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, totp } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    // Search for user by username
    const users = await db.select().from(userSchema)
        .where(and(
            eq(userSchema.isDeleted, false),
            or(
                eq(userSchema.username, String(username).toLowerCase()),
                eq(userSchema.email, String(username).toLowerCase()),
                eq(userSchema.id, String(username))
            )
        ));

    // If there isn't a user, error.
    if (users.length !== 1) {
        await log(`Failed login from IP ${ip}`)
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    // If the password is incorrect
    const isPassCorrect = await comparePassword(password, String(users[0].password));
    if (!isPassCorrect) {
        await log(`Failed login from IP ${ip}`)
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    if (users[0].totpEnabled) {

        // Check if user even bothered to give us a totp code
        if (!totp) {
            await log(`Failed login from IP ${ip} - missing totp`)
            return res.status(401).json({
                message: "Please provide a TOTP code",
                totpRequired: true
            });
        }

        // Verify TOTP code
        // const isTotpCorrect = verifyTOTP(users[0].totpSecret, totp);
        const isTotpCorrect = verifyTOTP("3UWIINDEILTF67VQ3RVLXSWZZGX5REFF", totp);
        console.log(isTotpCorrect, "is totp correct?")

        if (isTotpCorrect === false) {
            await log(`Failed login from IP ${ip} - invalid totp`)
            return res.status(401).json({
                message: "Invalid TOTP code",
                totpRequired: true
            });
        }
    }

    // Create a JWT - make it last for 24 hours
    const token = jwt.sign({ id: users[0].id, username: (users[0].username).toLowerCase() }, process.env.AUTH_SECRET, { expiresIn: '86400s' });

    await log(`Successfully logged in with IP ${ip}`, users[0].id)

    res.cookie('TOKEN', token, { maxAge: 86400, httpOnly: true, sameSite: true, secure: true }).json({ TOKEN: token });

};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    // Check for idiots
    if (username.length === 0) {
        await log(`Failed password recovery from IP ${ip}`)
        return res.status(400).json({
            message: "Username cannot be empty",
        });
    }


    // Search for user by username
    const users = await db.select().from(userSchema)
        .where(and(
            eq(userSchema.isDeleted, false),
            or(
                eq(userSchema.username, String(username)),
                eq(userSchema.email, String(username)),
                eq(userSchema.id, String(username))
            )
        ));

    // If there isn't a user, error.
    if (users.length !== 1) {
        await log(`Failed password recovery from IP ${ip}`)
        return res.status(401).json({
            message: "Can't update account - please contact a technician.",
        });
    }

    // Get a reset token to set and send for the user.
    // Let them have an hour to send it
    const _resetToken = generateSecureCode();
    const _resetExpiry: Date = new Date(new Date().getTime() + 60 * 60 * 1000);


    // Add the token to the user
    const updatedUser = await db.update(userSchema)
        .set({ resetToken: _resetToken, resetTokenExpiry: _resetExpiry })
        .where(eq(userSchema.id, users[0].id));

    // Send Password Email
    const emailResponse = await email.SendPasswordResetEmail(users[0].email, users[0].shortName, _resetToken)

    await log(`Requested password reset email with IP ${ip}`, users[0].id)

    // Send 201
    res.status(201).json({ message: "Please check your email for the verification code" })
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { resetToken, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const serverTime = new Date();

    // Search for user by username
    const users = await db.select().from(userSchema)
        .where(and(
            eq(userSchema.isDeleted, false),
            eq(userSchema.resetToken, String(resetToken).toUpperCase()),
            gt(userSchema.resetTokenExpiry, serverTime)
        ));

    // If there isn't a user, error.
    if (users.length !== 1) {
        await log(`Failed to change password from IP ${ip}`)
        return res.status(401).json({
            message: "Token has expired or cannot find user...",
        });
    }

    // Add the token to the user
    const updatedUser = await db.update(userSchema)
        .set({ resetToken: null, resetTokenExpiry: null, password: await hashPassword(password) })
        .where(eq(userSchema.id, users[0].id));

    // Send Password Email
    const emailResponse = await email.SendPasswordUpdatedEmail(users[0].email, users[0].shortName)

    await log("Has changed password from IP " + ip, users[0].id)

    // Send 201
    res.status(201).json({ message: "Password Updated" })
};


export default { login, forgotPassword, changePassword };