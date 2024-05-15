import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { events as eventSchema, users as userSchema, timetables as timetableSchema } from '@/db/schema';
import { eq, and, or, gte, lte, lt, gt } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { dateToString, dateTimeToString } from "@/utils/date";
import { log } from "@/utils/log";
import { convertSpaceCodeToTimetableId } from "@/controllers/timetables"
const moment = require('moment');
const dotenv = require('dotenv');
dotenv.config();

const getCarouselItemById = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id

    const events = await db.select()
        .from(eventSchema)
        .where(eq(eventSchema.id, eventId))

    res.json({ events: events });
}

const getAllCarousels = async (req: Request, res: Response, next: NextFunction) => {
    const events = await db.select()
        .from(eventSchema)

    res.json({ events: events });
}

const getAllCarouselItemsForCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const events = await db.select()
        .from(eventSchema)

    res.json({ events: events });
}

const getAllCarouselsAndItemsForATimetable = async (req: Request, res: Response, next: NextFunction) => {
    const events = await db.select()
        .from(eventSchema)

    res.json({ events: events });
}

const createCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create events" })
        return
    }

    const adjustedEndTime = new Date(req.body.end)
    adjustedEndTime.setMinutes(adjustedEndTime.getMinutes() - 1);

    const adjustedStartTime = new Date(req.body.start)
    adjustedStartTime.setMinutes(adjustedStartTime.getMinutes() + 1);

    const clashingEvents = await db.select()
        .from(eventSchema)
        .where(
            and(
                eq(eventSchema.timetableId, req.body.timetableId),
                and(
                    gte(eventSchema.end, dateTimeToString(adjustedStartTime)),
                    lte(eventSchema.start, dateTimeToString(adjustedEndTime))
                )
            )
        );

    if (clashingEvents.length !== 0) {
        res.status(409).json({ message: "Event already exists on that timetable at that time." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const newEvent = await db.insert(eventSchema).values({
        name: req.body.name,
        staff: req.body.staff || null,
        moduleCode: req.body.moduleCode || null,
        timetableId: req.body.timetableId,
        type: req.body.type || 'OTHER',
        colour: req.body.colour || "#ff0077",
        start: req.body.start || "",
        end: req.body.end || "",
        lastModified: currentTimeStr,
        modifiedBy: getUserIdFromJWT(token),
        isCombinedSession: req.body.isCombinedSession || false,
        group: req.body.group || null,
    });

    await log(`Has created event ${req.body.name} (${req.body.moduleCode || "none"}), starting ${req.body.start} and ending ${req.body.end} to Timetable ${req.body.timetableId}`, currentUserId)

    res.status(201).json({ timetableId: req.body.timetableId, message: 'Event has been created' });
};

const createCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create events" })
        return
    }

    const adjustedEndTime = new Date(req.body.end)
    adjustedEndTime.setMinutes(adjustedEndTime.getMinutes() - 1);

    const adjustedStartTime = new Date(req.body.start)
    adjustedStartTime.setMinutes(adjustedStartTime.getMinutes() + 1);

    const clashingEvents = await db.select()
        .from(eventSchema)
        .where(
            and(
                eq(eventSchema.timetableId, req.body.timetableId),
                and(
                    gte(eventSchema.end, dateTimeToString(adjustedStartTime)),
                    lte(eventSchema.start, dateTimeToString(adjustedEndTime))
                )
            )
        );

    if (clashingEvents.length !== 0) {
        res.status(409).json({ message: "Event already exists on that timetable at that time." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const newEvent = await db.insert(eventSchema).values({
        name: req.body.name,
        staff: req.body.staff || null,
        moduleCode: req.body.moduleCode || null,
        timetableId: req.body.timetableId,
        type: req.body.type || 'OTHER',
        colour: req.body.colour || "#ff0077",
        start: req.body.start || "",
        end: req.body.end || "",
        lastModified: currentTimeStr,
        modifiedBy: getUserIdFromJWT(token),
        isCombinedSession: req.body.isCombinedSession || false,
        group: req.body.group || null,
    });

    await log(`Has created event ${req.body.name} (${req.body.moduleCode || "none"}), starting ${req.body.start} and ending ${req.body.end} to Timetable ${req.body.timetableId}`, currentUserId)

    res.status(201).json({ timetableId: req.body.timetableId, message: 'Event has been created' });
};


const deleteCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete events" })
        return
    }

    // Check if the event exists before trying to delete it
    const foundEvent = await db.select()
        .from(eventSchema)
        .where(eq(eventSchema.id, eventId));

    if (foundEvent.length !== 1) {
        res.status(404).json({ message: "Could not find event to delete, has it already been deleted?" });
        return;
    }

    // Delete it
    try {
        await db.delete(eventSchema).where(eq(eventSchema.id, foundEvent[0].id));
    } catch {
        res.status(500).json({ "message": "Couldn't delete the event you specified" })
    }

    await log(`Has deleted event ${req.body.eventId}`, currentUserId)

    res.status(200).json({ event: foundEvent[0].id, message: "Event has been deleted" })
}

const deleteCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete events" })
        return
    }

    // Check if the event exists before trying to delete it
    const foundEvent = await db.select()
        .from(eventSchema)
        .where(eq(eventSchema.id, eventId));

    if (foundEvent.length !== 1) {
        res.status(404).json({ message: "Could not find event to delete, has it already been deleted?" });
        return;
    }

    // Delete it
    try {
        await db.delete(eventSchema).where(eq(eventSchema.id, foundEvent[0].id));
    } catch {
        res.status(500).json({ "message": "Couldn't delete the event you specified" })
    }

    await log(`Has deleted event ${req.body.eventId}`, currentUserId)

    res.status(200).json({ event: foundEvent[0].id, message: "Event has been deleted" })
}

const updateCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update events" })
        return
    }

    // Check if the event exists before trying to delete it
    const event = await db.select()
        .from(eventSchema)
        .where(eq(eventSchema.id, eventId));

    if (event.length !== 1) {
        res.status(404).json({ message: "Could not find event to update." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const updatedTimetable = await db.update(eventSchema)
        .set({
            name: req.body.name || event[0].name,
            staff: req.body.staff || event[0].staff,
            moduleCode: req.body.moduleCode || event[0].moduleCode,
            timetableId: req.body.timetableId || event[0].timetableId,
            type: req.body.type || event[0].type,
            colour: req.body.colour || event[0].colour,
            start: req.body.start || event[0].start,
            end: req.body.end || event[0].end,
            lastModified: currentTimeStr,
            modifiedBy: currentUserId,
            isCombinedSession: req.body.isCombinedSession || event[0].isCombinedSession,
            group: req.body.group || event[0].group,
        })
        .where(eq(eventSchema.id, event[0].id));

    res.status(201).json({ message: `Event '${event[0].name}' has been updated`, event: event[0].id });

    await log(`Has updated event ${req.body.eventId}`, currentUserId)
}

const updateCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
    const eventId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update events" })
        return
    }

    // Check if the event exists before trying to delete it
    const event = await db.select()
        .from(eventSchema)
        .where(eq(eventSchema.id, eventId));

    if (event.length !== 1) {
        res.status(404).json({ message: "Could not find event to update." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const updatedTimetable = await db.update(eventSchema)
        .set({
            name: req.body.name || event[0].name,
            staff: req.body.staff || event[0].staff,
            moduleCode: req.body.moduleCode || event[0].moduleCode,
            timetableId: req.body.timetableId || event[0].timetableId,
            type: req.body.type || event[0].type,
            colour: req.body.colour || event[0].colour,
            start: req.body.start || event[0].start,
            end: req.body.end || event[0].end,
            lastModified: currentTimeStr,
            modifiedBy: currentUserId,
            isCombinedSession: req.body.isCombinedSession || event[0].isCombinedSession,
            group: req.body.group || event[0].group,
        })
        .where(eq(eventSchema.id, event[0].id));

    res.status(201).json({ message: `Event '${event[0].name}' has been updated`, event: event[0].id });

    await log(`Has updated event ${req.body.eventId}`, currentUserId)
}

export default {
    getCarouselItemById,
    getAllCarousels,
    getAllCarouselItemsForCarousel,
    getAllCarouselsAndItemsForATimetable,
    createCarousel,
    createCarouselItem,
    deleteCarousel,
    deleteCarouselItem,
    updateCarousel,
    updateCarouselItem
};