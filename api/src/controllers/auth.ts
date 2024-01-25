import { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { users as userSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
// import { hashPassword, comparePassword } from '@/utils/passwords';
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (rawPassword: String): Promise<string> => {
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);
    return passwordHash;
};

const comparePassword = async (userInput: String, passwordHash: String) => {
    const passCorrect = await bcrypt.compare(userInput, passwordHash);
    return passCorrect;
};

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

export default { login };