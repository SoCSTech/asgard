import { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { logs as logSchema, users as userSchema } from '@/db/schema';
import { eq,  gte } from 'drizzle-orm';

const dotenv = require('dotenv');
dotenv.config();

const selection = {
    id: logSchema.id,
    userId: userSchema.id,
    username: userSchema.username,
    shortName: userSchema.shortName,
    fullName: userSchema.fullName,
    role: userSchema.role,
    email: userSchema.email,
    profilePictureUrl: userSchema.profilePictureUrl,
    message: logSchema.message,
    time: logSchema.time
};

const getLogById = async (req: Request, res: Response, next: NextFunction) => {
    const logId: string = req.params.id

    const logs = await db.select(selection)
        .from(logSchema)
        .where(eq(logSchema.id, logId))
        .leftJoin(userSchema, eq(logSchema.user, userSchema.id))

    res.json({ logs: logs });
}

const getAllLogs = async (req: Request, res: Response, next: NextFunction) => {
    // Get all the logs in the last 48 hours
    const logs = await db.select(selection)
        .from(logSchema)
        .where(gte(logSchema.time, new Date(Date.now() - 48 * 60 * 60 * 1000)))
        .leftJoin(userSchema, eq(logSchema.user, userSchema.id))

    res.json({ logs: logs });
}

export default { getLogById, getAllLogs };