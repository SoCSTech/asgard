import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { logs as logSchema, users as userSchema } from '@/db/schema';
import { eq, and, or, gte, lte } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import users from "./users";
const dotenv = require('dotenv');
dotenv.config();

const getLogById = async (req: Request, res: Response, next: NextFunction) => {
    const logId: string = req.params.id

    const logs = await db.select()
        .from(logSchema)
        .where(eq(logSchema.id, logId))

    res.json({ logs: logs });
}

const getAllLogs = async (req: Request, res: Response, next: NextFunction) => {
    // Get all the logs in the last 48 hours
    
    const logs = await db.select()
        .from(logSchema)
        .where(gte(logSchema.time, new Date(Date.now() - 48 * 60 * 60 * 1000)))
        .leftJoin(userSchema, eq(logSchema.user, userSchema.id))

    res.json({ logs: logs });
}

export default { getLogById, getAllLogs };