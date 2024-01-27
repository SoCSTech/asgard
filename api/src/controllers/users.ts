import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { users as userSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { hashPassword, comparePassword } from '@/utils/passwords';
import * as email from '@/communication/email';
import { generateSecureCode, getUserIdFromJWT } from "@/utils/auth";
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/// User Schema for responses
const simplifiedUser = {
    id: userSchema.id,
    username: userSchema.username,
    shortName: userSchema.shortName,
    fullName: userSchema.fullName,
    initials: userSchema.initials,
    role: userSchema.role,
    email: userSchema.email,
    creationDate: userSchema.creationDate,
    profilePictureUrl: userSchema.profilePictureUrl,
    canLogin: userSchema.canLogin,
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id

    if (userId == 'me') {
        // Get the token from request headers, query params, cookies, etc.
        let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

        try {
            token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
        }
        catch (error) {
            console.error(error);
        }

        userId = getUserIdFromJWT(token);
    }

    const user = await db.select(simplifiedUser).from(userSchema)
        .where(
            and(
                or(
                    eq(userSchema.id, String(userId)),
                    eq(userSchema.username, String(userId)),
                ),
                eq(userSchema.isDeleted, false))
        );
        
    res.json({ users: user });


    // // Search for user by username
    // const users = await db.select().from(userSchema)
    //     .where(and(
    //         eq(userSchema.isDeleted, false),
    //         or(
    //             eq(userSchema.username, String(username)),
    //             eq(userSchema.email, String(username))
    //         )
    //     ));

    // // If there isn't a user, error.
    // if (users.length !== 1) {
    //     return res.status(401).json({
    //         message: "Invalid username or password",
    //     });
    // }

    // // If the password is incorrect
    // const isPassCorrect = await comparePassword(password, String(users[0].password));
    // if (!isPassCorrect) {
    //     return res.status(401).json({
    //         message: "Invalid username or password",
    //     });
    // }

    // // Create a JWT
    // const token = jwt.sign({ id: users[0].id, username: users[0].username, }, process.env.AUTH_SECRET, { expiresIn: '1800s' });

    // res.cookie('TOKEN', token, { maxAge: 1800, httpOnly: true, sameSite: true, secure: true }).json({ TOKEN: token });

};

export default { getUserById };