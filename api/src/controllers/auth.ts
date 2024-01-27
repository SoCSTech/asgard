import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { users as userSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { hashPassword, comparePassword } from '@/utils/passwords';
import * as email from '@/communication/email';
import { generateSecureCode } from "@/utils/auth";
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    // Search for user by username
    const users = await db.select().from(userSchema)
        .where(and(
            eq(userSchema.canLogin, true),
            eq(userSchema.isDeleted, false),
            or(
                eq(userSchema.username, String(username)),
                eq(userSchema.email, String(username))
            )
        ));

    // If there isn't a user, error.
    if (users.length !== 1) {
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    // If the password is incorrect
    const isPassCorrect = await comparePassword(password, String(users[0].password));
    if (!isPassCorrect) {
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }

    // Create a JWT
    const token = jwt.sign({ id: users[0].id, username: users[0].username, }, process.env.AUTH_SECRET, { expiresIn: '1800s' });

    res.cookie('TOKEN', token, { maxAge: 1800, httpOnly: true, sameSite: true, secure: true }).json({ TOKEN: token });

};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    // Search for user by username
    const users = await db.select().from(userSchema)
        .where(and(
            eq(userSchema.canLogin, true),
            eq(userSchema.isDeleted, false),
            or(
                eq(userSchema.username, String(username)),
                eq(userSchema.email, String(username))
            )
        ));

    // If there isn't a user, error.
    if (users.length !== 1) {
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
    await email.SendPasswordResetEmail(users[0].email, users[0].shortName, _resetToken)

    // Send 201
    res.status(201).json({ message: "Please check your email for the verification code" })
};


export default { login, forgotPassword };