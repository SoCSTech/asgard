import { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetableGroups as groupSchema, users as userSchema, timetables as timetableSchema, events as eventSchema } from '@/db/schema';
import { like, or } from 'drizzle-orm';
import { simplifiedUser } from "@/utils/users";

const dotenv = require('dotenv');
dotenv.config();

const searchQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = `%${req.params.query}%` as string // fuzzy search
        
        const timetables = await db.select().from(timetableSchema)
            .where(or(
                like(timetableSchema.id, query),
                like(timetableSchema.name, query),
                like(timetableSchema.lab, query),
                like(timetableSchema.spaceCode, query)
            ));

        const events = await db.select().from(eventSchema)
            .where(or(
                like(eventSchema.id, query),
                like(eventSchema.name, query),
                like(eventSchema.staff, query),
                like(eventSchema.start, query),
                like(eventSchema.end, query),
                like(eventSchema.moduleCode, query),
                like(eventSchema.type, query),
                like(eventSchema.group, query),
            ));

        const users = await db.select(simplifiedUser).from(userSchema)
            .where(or(
                like(userSchema.id, query),
                like(userSchema.fullName, query),
                like(userSchema.shortName, query),
                like(userSchema.email, query),
                like(userSchema.initials, query),
                like(userSchema.role, query)
            ));

        const groups = await db.select().from(groupSchema)
            .where(or(
                like(groupSchema.id, query),
                like(groupSchema.internalName, query),
                like(groupSchema.name, query),
                like(groupSchema.subtitle, query),
                like(groupSchema.verbAvailable, query),
                like(groupSchema.verbUnavailable, query),
                like(groupSchema.object, query),
                like(groupSchema.infoPaneQRUrl, query),
                like(groupSchema.infoPaneText, query)
            ));

        res.json({ query: req.params.query, timetables: timetables, events: events, users: users, groups: groups });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" })
    }
}

export default { searchQuery };