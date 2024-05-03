import { db } from "@/db";
import {users as userSchema } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
const crypto = require("crypto");

/// User Schema for responses
export const simplifiedUser = {
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
export const newUser = {
    username: userSchema.username,
    shortName: userSchema.shortName,
    fullName: userSchema.fullName,
    role: userSchema.role,
    email: userSchema.email,
}

export const getGravatarUrl = async (email: String): Promise<string> => {
    const hash = await crypto.createHash('md5').update(email).digest("hex")
    return `https://gravatar.com/avatar/${hash}?s=100&r=pg&d=retro`
};

export const isUserATechnician = async (userId: string): Promise<boolean> => {
    const admin = await db.select({ role: userSchema.role }).from(userSchema)
        .where(
            and(
                eq(userSchema.id, String(userId)),
                eq(userSchema.isDeleted, false))
        );

    if (admin[0].role === "TECHNICIAN") { return true}
    else { return false }
};