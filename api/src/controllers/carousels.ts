import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { carousels as carouselSchema, carouselItems as carouselItemsSchema, timetables as timetableSchema } from '@/db/schema';
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
    const itemId: string = req.params.itemId

    const items = await db.select()
        .from(carouselSchema)
        .where(and(
            eq(carouselSchema.id, itemId),
            eq(carouselSchema.isDeleted, false)
        ))

    res.json({ carouselItems: items });
}

const getAllCarousels = async (req: Request, res: Response, next: NextFunction) => {
    const items = await db.select()
        .from(carouselSchema)
        .where(
            eq(carouselSchema.isDeleted, false)
        )

    res.json({ carousels: items });
}

const getCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const carouselId: string = req.params.carouselId

    const items = await db.select()
        .from(carouselSchema)
        .where(
            and(
                eq(carouselSchema.isDeleted, false),
                eq(carouselSchema.id, carouselId)
            ))

    res.json({ carouselItems: items });
}

const getAllCarouselsAndItemsForATimetable = async (req: Request, res: Response, next: NextFunction) => {
    const timetableId: string = await convertSpaceCodeToTimetableId(req.params.timetableId)

    const carousel = await db.select()
        .from(carouselSchema)
        .where(
            and(
                eq(carouselSchema.timetable, timetableId),
                eq(carouselSchema.isDeleted, false)
            )
        )

    const items = await db.select()
        .from(carouselItemsSchema)
        .where(
            and(
                eq(carouselItemsSchema.isDeleted, false),
                eq(carouselItemsSchema.carousel, carousel[0].id)
            )).orderBy(carouselItemsSchema.order)

    res.json({ carousel: carousel[0], items: items });
}

const createCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create events" })
        return
    }

    if (!req.body.timetable) {
        res.status(409).json({ message: "Timetable hasn't been provided" });
        return;
    }

    let timetableId = await convertSpaceCodeToTimetableId(req.body.timetable)

    const existingCarousels = await db.select()
        .from(carouselSchema)
        .where(
            and(
                eq(carouselSchema.timetable, timetableId),
                eq(carouselSchema.isDeleted, false)
            )
        );

    if (existingCarousels.length !== 0) {
        res.status(409).json({ message: "Carousel already exists on that timetable" });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const newCarousel = await db.insert(carouselSchema).values({
        timetable: timetableId,
        lastModified: currentTimeStr,
        modifiedBy: getUserIdFromJWT(token)
    });

    await log(`Has created carousel for Timetable ${req.body.timetable}`, currentUserId)

    res.status(201).json({ timetable: req.body.timetable, message: 'Carousel has been created' });
};

const createCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create events" })
        return
    }

    const existingItems = await db.select()
        .from(carouselItemsSchema)
        .where(
            and(
                eq(carouselItemsSchema.carousel, req.body.carousel),
                eq(carouselItemsSchema.isDeleted, false)
            )
        );

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const newItem = await db.insert(carouselItemsSchema).values({
        carousel: req.body.carousel,
        lastModified: currentTimeStr,
        modifiedBy: getUserIdFromJWT(token),
        type: req.body.type || 'TIMETABLE',
        name: req.body.name || 'Untitled',
        durationMs: req.body.durationMs || 4500,
        order: existingItems.length,
        contentUrl: req.body.contentUrl || null
    });

    await log(`Has created item for carousel ${req.body.carousel}`, currentUserId)

    res.status(201).json({ carousel: req.body.carousel, message: 'Carousel item has been created' });
};


// const deleteCarousel = async (req: Request, res: Response, next: NextFunction) => {
//     const eventId: string = req.params.id

//     const token = getTokenFromAuthCookie(req, res)
//     const currentUserId = getUserIdFromJWT(token);
//     if (await isUserATechnician(currentUserId) == false) {
//         res.status(401).json({ "message": "You don't have permission to delete events" })
//         return
//     }

//     // Check if the event exists before trying to delete it
//     const foundEvent = await db.select()
//         .from(eventSchema)
//         .where(eq(eventSchema.id, eventId));

//     if (foundEvent.length !== 1) {
//         res.status(404).json({ message: "Could not find event to delete, has it already been deleted?" });
//         return;
//     }

//     // Delete it
//     try {
//         await db.delete(eventSchema).where(eq(eventSchema.id, foundEvent[0].id));
//     } catch {
//         res.status(500).json({ "message": "Couldn't delete the event you specified" })
//     }

//     await log(`Has deleted event ${req.body.eventId}`, currentUserId)

//     res.status(200).json({ event: foundEvent[0].id, message: "Event has been deleted" })
// }

// const deleteCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
//     const eventId: string = req.params.id

//     const token = getTokenFromAuthCookie(req, res)
//     const currentUserId = getUserIdFromJWT(token);
//     if (await isUserATechnician(currentUserId) == false) {
//         res.status(401).json({ "message": "You don't have permission to delete events" })
//         return
//     }

//     // Check if the event exists before trying to delete it
//     const foundEvent = await db.select()
//         .from(eventSchema)
//         .where(eq(eventSchema.id, eventId));

//     if (foundEvent.length !== 1) {
//         res.status(404).json({ message: "Could not find event to delete, has it already been deleted?" });
//         return;
//     }

//     // Delete it
//     try {
//         await db.delete(eventSchema).where(eq(eventSchema.id, foundEvent[0].id));
//     } catch {
//         res.status(500).json({ "message": "Couldn't delete the event you specified" })
//     }

//     await log(`Has deleted event ${req.body.eventId}`, currentUserId)

//     res.status(200).json({ event: foundEvent[0].id, message: "Event has been deleted" })
// }

// const updateCarousel = async (req: Request, res: Response, next: NextFunction) => {
//     const eventId: string = req.params.id

//     const token = getTokenFromAuthCookie(req, res)
//     const currentUserId = getUserIdFromJWT(token);
//     if (await isUserATechnician(currentUserId) == false) {
//         res.status(401).json({ "message": "You don't have permission to update events" })
//         return
//     }

//     // Check if the event exists before trying to delete it
//     const event = await db.select()
//         .from(eventSchema)
//         .where(eq(eventSchema.id, eventId));

//     if (event.length !== 1) {
//         res.status(404).json({ message: "Could not find event to update." });
//         return;
//     }

//     let currentTime: Date = new Date();
//     let currentTimeStr = dateTimeToString(currentTime);

//     const updatedTimetable = await db.update(eventSchema)
//         .set({
//             name: req.body.name || event[0].name,
//             staff: req.body.staff || event[0].staff,
//             moduleCode: req.body.moduleCode || event[0].moduleCode,
//             timetableId: req.body.timetableId || event[0].timetableId,
//             type: req.body.type || event[0].type,
//             colour: req.body.colour || event[0].colour,
//             start: req.body.start || event[0].start,
//             end: req.body.end || event[0].end,
//             lastModified: currentTimeStr,
//             modifiedBy: currentUserId,
//             isCombinedSession: req.body.isCombinedSession || event[0].isCombinedSession,
//             group: req.body.group || event[0].group,
//         })
//         .where(eq(eventSchema.id, event[0].id));

//     res.status(201).json({ message: `Event '${event[0].name}' has been updated`, event: event[0].id });

//     await log(`Has updated event ${req.body.eventId}`, currentUserId)
// }

// const updateCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
//     const eventId: string = req.params.id

//     const token = getTokenFromAuthCookie(req, res)
//     const currentUserId = getUserIdFromJWT(token);
//     if (await isUserATechnician(currentUserId) == false) {
//         res.status(401).json({ "message": "You don't have permission to update events" })
//         return
//     }

//     // Check if the event exists before trying to delete it
//     const event = await db.select()
//         .from(eventSchema)
//         .where(eq(eventSchema.id, eventId));

//     if (event.length !== 1) {
//         res.status(404).json({ message: "Could not find event to update." });
//         return;
//     }

//     let currentTime: Date = new Date();
//     let currentTimeStr = dateTimeToString(currentTime);

//     const updatedTimetable = await db.update(eventSchema)
//         .set({
//             name: req.body.name || event[0].name,
//             staff: req.body.staff || event[0].staff,
//             moduleCode: req.body.moduleCode || event[0].moduleCode,
//             timetableId: req.body.timetableId || event[0].timetableId,
//             type: req.body.type || event[0].type,
//             colour: req.body.colour || event[0].colour,
//             start: req.body.start || event[0].start,
//             end: req.body.end || event[0].end,
//             lastModified: currentTimeStr,
//             modifiedBy: currentUserId,
//             isCombinedSession: req.body.isCombinedSession || event[0].isCombinedSession,
//             group: req.body.group || event[0].group,
//         })
//         .where(eq(eventSchema.id, event[0].id));

//     res.status(201).json({ message: `Event '${event[0].name}' has been updated`, event: event[0].id });

//     await log(`Has updated event ${req.body.eventId}`, currentUserId)
// }

export default {
    getCarouselItemById,
    getAllCarousels,
    getCarousel,
    getAllCarouselsAndItemsForATimetable,
    createCarousel,
    createCarouselItem,
    // deleteCarousel,
    // deleteCarouselItem,
    // updateCarousel,
    // updateCarouselItem
};