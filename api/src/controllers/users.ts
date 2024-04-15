import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { users as userSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import * as email from '@/communication/email';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { getGravatarUrl } from "@/utils/users";
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
        const token = getTokenFromAuthCookie(req, res)
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

const getUserProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id

    if (userId == 'me') {
        const token = getTokenFromAuthCookie(req, res)
        userId = getUserIdFromJWT(token);
    }

    const user = await db.select({ profilePictureUrl: userSchema.profilePictureUrl }).from(userSchema)
        .where(
            and(
                or(
                    eq(userSchema.id, String(userId)),
                    eq(userSchema.username, String(userId)),
                ),
                eq(userSchema.isDeleted, false))
        );

    if (user.length !== 1) {
        res.status(404).json({ "message": "Couldn't get profile picture" })
        return
    }

    if (user[0].profilePictureUrl === null) {
        res.status(404).json({ "message": "User hasn't set profile picture" })
        return
    }

    res.redirect(user[0].profilePictureUrl as string)
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)

    const users = await db.select(simplifiedUser)
        .from(userSchema)
        .where(eq(userSchema.isDeleted, false));

    res.json({ users: users });
};

const getAllDeletedUsers = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)

    const users = await db.select(simplifiedUser)
        .from(userSchema)
        .where(eq(userSchema.isDeleted, true));

    res.json({ users: users });
};


// POST: { "username": "jsmith", "shortName": "John", "fullName": "John Smith", "role": "TECHNICIAN", "email": "joshcooper+jsmith@lincoln.ac.uk" }
const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // This is the id of the person who is logged in sending the invite out.
    const token = getTokenFromAuthCookie(req, res)
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
        initials: (req.body.fullName).replace("-", " ").split(" ").map((name: string) => name.charAt(0).toUpperCase()).join("").slice(0, 3),
        profilePictureUrl: await getGravatarUrl(req.body.email)
    })

    email.SendWelcomeEmail(req.body.email, req.body.shortName, req.body.username);

    res.status(201).json({ username: req.body.username, message: 'User has been created' });
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id

    // This is the id of the person who is logged in
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);

    if (userId === currentUserId) {
        res.status(401).json({ "message": "Cannot delete own account" })
        return
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
        res.status(404).json({ "message": "Cannot find account" })
        return
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
        res.status(401).json({ "message": "You don't have permission to delete user accounts" })
        return
    }

    const updatedUser = await db.update(userSchema)
        .set({ isDeleted: true })
        .where(eq(userSchema.id, user[0].id));

    res.status(201).json({ user: user[0].id, message: `Account '${user[0].username}' has been deleted` });
};

const undeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id
    const token = getTokenFromAuthCookie(req, res)

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
        return
    }

    const updatedUser = await db.update(userSchema)
        .set({ isDeleted: false })
        .where(eq(userSchema.id, user[0].id));

    res.status(201).json({ user: user[0].id, message: `Account '${user[0].username}' has been reactivated` });
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    let userId: string = req.params.id
    const token = getTokenFromAuthCookie(req, res)

    // This is the id of the person who is logged in sending the invite out.
    const currentUserId = getUserIdFromJWT(token);

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
        return
    }

    const user = await db.select(simplifiedUser).from(userSchema)
        .where(
            or(
                eq(userSchema.id, String(userId)),
                eq(userSchema.username, String(userId)),
            )
        );

    if (user.length !== 1) {
        res.status(404).json({ "message": "Cannot find account or account is already active" })
    }

    const updatedUser = await db.update(userSchema)
        .set({
            username: req.body.username || user[0].username,
            shortName: req.body.shortName || user[0].shortName,
            fullName: req.body.fullName || user[0].fullName,
            initials: req.body.initials || user[0].initials,
            role: req.body.role || user[0].role,
            email: req.body.email || user[0].email,
            profilePictureUrl: req.body.profilePictureUrl || user[0].profilePictureUrl
        })
        .where(eq(userSchema.id, user[0].id));

    res.status(201).json({ user: user[0].id, message: `Account '${user[0].username}' has been updated` });
};

export default { getUserById, getUserProfilePicture, getAllUsers, getAllDeletedUsers, createUser, deleteUser, undeleteUser, updateUser };