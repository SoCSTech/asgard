import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { events as eventSchema, users as userSchema } from '@/db/schema';
import { eq, and, or, gte, lte } from 'drizzle-orm';
import { getUserIdFromJWT, verifyUserAuthToken } from "@/utils/auth";
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

    // Check if user has room access or is a technician (god)

    const clashingEvents = await db.select()
        .from(eventSchema)
        .where(
            and(
                eq(eventSchema.timetable, req.body.timetable),
                and(
                    gte(eventSchema.end, req.body.start),
                    lte(req.body.end, req.body.end)
                )
            ))

    if (clashingEvents.length !== 0) {
        res.status(409).json({ message: "Event already exists on that timetable at that time." })
        return
    }

    const newEvent = await db.insert(eventSchema).values({
        name: req.body.name,
        moduleCode: req.body.moduleCode || null,
        timetable: req.body.timetable,
        type: req.body.type || 'OTHER',
        colour: req.body.colour || "#ff0077", 
        start: Date(req.body.start),
        end: Date(req.body.end),
        lastModified: Date.now(),
        modifiedBy: getUserIdFromJWT(token),
        isCombinedSession: req.body.isCombinedSession || false
    })

}

const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)
    const eventId: string = req.params.id


}

const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)
    const eventId: string = req.params.id

}

const getEventsForTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)
    const eventId: string = req.params.eventId
    const timetableId: string = req.params.timetableId


}

export default { getEventById, getAllEvents, createEvent, deleteEvent, updateEvent, getEventsForTimetable };