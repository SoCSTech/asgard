import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { users as userSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
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
};

// Schema of New User
const newUser = {
    username: userSchema.username,
    shortName: userSchema.shortName,
    fullName: userSchema.fullName,
    role: userSchema.role,
    email: userSchema.email,
}

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
            res.status(401).json({ "message": "Invalid auth token" })
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
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const users = await db.select(simplifiedUser)
        .from(userSchema)
        .where(eq(userSchema.isDeleted, false));

    res.json({ users: users });
};

// POST: { "username": "jsmith", "shortName": "John", "fullName": "John Smith", "role": "TECHNICIAN", "email": "joshcooper+jsmith@lincoln.ac.uk" }
const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

    // This is the id of the person who is logged in sending the invite out.
    const invitingUserId = getUserIdFromJWT(token);


    // Check the user doesn't already exist
    const oldUsers = await db.select(simplifiedUser).from(userSchema)
        .where(
            eq(userSchema.username, String(req.body.username))
        );

    if (oldUsers.length != 0) {
        res.status(409).json({ "message": "User with that username already exists." })
        return;
    }

    // Push to DB new user
    const user = await db.insert(userSchema).values({
        username: req.body.username,
        shortName: req.body.shortName,
        fullName: req.body.fullName,
        role: req.body.role,
        email: req.body.email,
        initials: (req.body.fullName).replace("-", " ").split(" ").map((name: string) => name.charAt(0).toUpperCase()).join("").slice(0, 3)
    })

    email.SendWelcomeEmail(req.body.email, req.body.shortName, req.body.username);

    res.status(201).json({ username: req.body.username });
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id

    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({"message": "Invalid auth token"})
    }

    // This is the id of the person who is logged in sending the invite out.
    const currentUserId = getUserIdFromJWT(token);

    if (userId === currentUserId) {
        res.status(401).json({"message": "Cannot delete own account"})
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

    if (user.length !== 1) {
        res.status(404).json({"message": "Cannot find account"})
    }


    const admin = await db.select(simplifiedUser).from(userSchema)
        .where(
            and(
                or(
                    eq(userSchema.id, String(currentUserId)),
                ),
                eq(userSchema.isDeleted, false))
        );

    if (admin[0].role !== "TECHNICIAN") {
        res.status(401).json({"message": "You don't have permission to delete user accounts"})
    }

    const updatedUser = await db.update(userSchema)
        .set({ isDeleted: true })
        .where(eq(userSchema.id, user[0].id));

    res.status(201).json({ users: user });
};

const undeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id

    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

    // This is the id of the person who is logged in sending the invite out.
    const currentUserId = getUserIdFromJWT(token);

    const user = await db.select(simplifiedUser).from(userSchema)
        .where(
            and(
                or(
                    eq(userSchema.id, String(userId)),
                    eq(userSchema.username, String(userId)),
                ),
                eq(userSchema.isDeleted, true))
        );

    if (user.length !== 1) {
        res.status(404).json({ "message": "Cannot find account or account is already active" })
    }

    const admin = await db.select(simplifiedUser).from(userSchema)
        .where(
            and(
                or(
                    eq(userSchema.id, String(currentUserId)),
                ),
                eq(userSchema.isDeleted, false))
        );

    if (admin[0].role !== "TECHNICIAN") {
        res.status(401).json({ "message": "You don't have permission to reactivate user accounts" })
    }

    const updatedUser = await db.update(userSchema)
        .set({ isDeleted: false })
        .where(eq(userSchema.id, user[0].id));

    res.status(201).json({ users: user });
};

export default { getUserById, getAllUsers, createUser, deleteUser, undeleteUser };