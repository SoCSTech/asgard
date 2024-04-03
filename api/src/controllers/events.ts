import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { events as eventSchema, users as userSchema } from '@/db/schema';
import { eq, and, or, gte, lte } from 'drizzle-orm';
import { getUserIdFromJWT, verifyUserAuthToken } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { dateToString } from "@/utils/date";
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)
    const eventId: string = req.params.id

    const events = await db.select()
        .from(eventSchema)
        .where(eq(eventSchema.id, eventId))

    res.json({ events: events });
}

const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)

    const events = await db.select()
        .from(eventSchema)

    res.json({ events: events });
}

const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create events" })
        return
    }

    const clashingEvents = await db.select()
        .from(eventSchema)
        .where(
            and(
                eq(eventSchema.timetableId, req.body.timetableId),
                and(
                    gte(eventSchema.end, req.body.start),
                    lte(eventSchema.start, req.body.end) // corrected from req.body.end
                )
            )
        );

    if (clashingEvents.length !== 0) {
        res.status(409).json({ message: "Event already exists on that timetable at that time." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateToString(currentTime);

    const newEvent = await db.insert(eventSchema).values({
        name: req.body.name,
        staff: req.body.staff || "",
        moduleCode: req.body.moduleCode || null,
        timetableId: req.body.timetableId,
        type: req.body.type || 'OTHER',
        colour: req.body.colour || "#ff0077",
        start: req.body.start || "",
        end: req.body.end || "",
        lastModified: currentTimeStr,
        modifiedBy: getUserIdFromJWT(token),
        isCombinedSession: req.body.isCombinedSession || false
    });

    res.status(201).json({ message: "new event"})

};


const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id

    const token = verifyUserAuthToken(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete events" })
        return
    }


}

const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id
    
    const token = verifyUserAuthToken(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update events" })
        return
    }

}

const getEventsForTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.eventId
    const timetableId: string = req.params.timetableId
    
    const token = verifyUserAuthToken(req, res)
    

}

export default { getEventById, getAllEvents, createEvent, deleteEvent, updateEvent, getEventsForTimetable };