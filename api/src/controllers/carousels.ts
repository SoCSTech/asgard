import { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { carousels as carouselSchema, carouselItems as carouselItemsSchema, timetables as timetableSchema } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { dateTimeToString } from "@/utils/date";
import { log } from "@/utils/log";
import { convertSpaceCodeToTimetableId } from "@/controllers/timetables"
import { MqttCommunicator } from "@/communication/mqtt";
const mqtt = MqttCommunicator.instance

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

    if (items.length === 0) {
        res.json({ message: "Couldn't get carousel, does it exist?" }).status(404)
        return
    }

    res.json({ carouselItems: items });
}

const getAllCarousels = async (req: Request, res: Response, next: NextFunction) => {
    const items = await db.select()
        .from(carouselSchema)
        .leftJoin(timetableSchema, eq(carouselSchema.timetable, timetableSchema.id))
        .where(
            eq(carouselSchema.isDeleted, false)
        )

    res.json({ items });
}

const getCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const carouselId: string = req.params.carouselId

    const items = await db.select()
        .from(carouselSchema)
        .leftJoin(timetableSchema, eq(carouselSchema.timetable, timetableSchema.id))
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

    if (carousel.length == 0) {
        res.status(404).json({ message: "Carousel could not be found!" });
        return
    }

    const items = await db.select()
        .from(carouselItemsSchema)
        .where(
            and(
                eq(carouselItemsSchema.isDeleted, false),
                eq(carouselItemsSchema.carousel, carousel[0].id)
            )).orderBy(carouselItemsSchema.order)

    let totalDuration = 0
    items.map((x) => {
        totalDuration += x.durationMs
    })

    res.json({ carousel: carousel[0], items: items, totalDuration: totalDuration });
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
    await mqtt.SendCarouselRefresh(String(existingCarousels[0].id))
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
    await mqtt.SendCarouselRefresh(String(existingItems[0].carousel))
    res.status(201).json({ carousel: req.body.carousel, message: 'Carousel item has been created' });
};


const deleteCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const carouselId: string = req.params.carouselId;

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete events" })
        return
    }

    // Check if the event exists before trying to delete it
    const foundCarousel = await db.select()
        .from(carouselSchema)
        .where(eq(carouselSchema.id, carouselId));

    if (foundCarousel.length !== 1) {
        res.status(404).json({ message: "Could not find carousel to delete, has it already been deleted?" });
        return;
    }

    const updatedCarousel = await db.update(carouselSchema)
        .set({ isDeleted: true })
        .where(eq(carouselSchema.id, foundCarousel[0].id));

    await log(`Has deleted carousel ${foundCarousel[0].id}`, currentUserId)
    await mqtt.SendCarouselRefresh(String(foundCarousel[0].id))
    res.status(200).json({ carousel: foundCarousel[0].id, message: "Carousel has been deleted" })
}

const deleteCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
    const itemId: string = req.params.itemId;

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete events" })
        return
    }

    // Check if the event exists before trying to delete it
    const foundItem = await db.select()
        .from(carouselItemsSchema)
        .where(and(
            eq(carouselItemsSchema.id, itemId),
            eq(carouselItemsSchema.isDeleted, false)
        ));


    if (foundItem.length !== 1) {
        res.status(404).json({ message: "Could not find carousel item to delete, has it already been deleted?" });
        return;
    }

    if (foundItem[0].type == "TIMETABLE") {
        // Check if there is at least another timetable on the carousel
        const otherItemsInCarousel = await db.select()
            .from(carouselItemsSchema)
            .where(and(
                eq(carouselItemsSchema.carousel, String(foundItem[0].carousel)),
                eq(carouselItemsSchema.type, "TIMETABLE"),
                eq(carouselItemsSchema.isDeleted, false)
            ));

        if (otherItemsInCarousel.length <= 1) {
            res.status(406).json({ message: "You must have at least one timetable in your carousel!" })
            return
        }
    }

    const updatedItem = await db.update(carouselItemsSchema)
        .set({ isDeleted: true })
        .where(eq(carouselItemsSchema.id, foundItem[0].id));

    await log(`Has deleted carousel ${foundItem[0].id}`, currentUserId)
    await mqtt.SendCarouselRefresh(String(foundItem[0].carousel))
    res.status(200).json({ carouseItem: foundItem[0].id, message: "Carousel item has been deleted" })
}

const updateCarousel = async (req: Request, res: Response, next: NextFunction) => {
    const carouselId: string = req.params.carouselId

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update events" })
        return
    }

    // Check if the event exists before trying to delete it
    const carousel = await db.select()
        .from(carouselSchema)
        .where(eq(carouselSchema.id, carouselId));

    if (carousel.length !== 1) {
        res.status(404).json({ message: "Could not find carousel to update." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const updatedCarousel = await db.update(carouselSchema)
        .set({
            timetable: req.body.timetable || carousel[0].timetable,
            lastModified: currentTimeStr,
            modifiedBy: currentUserId,
            isDeleted: req.body.isDeleted || carousel[0].isDeleted,
        })
        .where(eq(carouselSchema.id, carousel[0].id));

    await mqtt.SendCarouselRefresh(String(carousel[0].id))
    await log(`Has updated carousel ${carousel[0].id}`, currentUserId)
    res.status(201).json({ message: `Carousel has been updated`, carousel: carousel[0].id });
}

const updateCarouselItem = async (req: Request, res: Response, next: NextFunction) => {
    const itemId: string = req.params.itemId

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update events" })
        return
    }

    // Check if the event exists before trying to delete it
    const item = await db.select()
        .from(carouselItemsSchema)
        .where(eq(carouselItemsSchema.id, itemId));

    if (item.length !== 1) {
        res.status(404).json({ message: "Could not find carousel item to update." });
        return;
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateTimeToString(currentTime);

    const updatedItem = await db.update(carouselItemsSchema)
        .set({
            carousel: req.body.carousel || item[0].carousel,
            lastModified: currentTimeStr,
            modifiedBy: currentUserId,
            type: req.body.type || item[0].type,
            contentUrl: req.body.contentUrl || item[0].contentUrl,
            name: req.body.name || item[0].name,
            isDeleted: req.body.isDeleted || item[0].isDeleted,
            durationMs: req.body.durationMs || item[0].durationMs,
            order: req.body.order || item[0].order
        })
        .where(eq(carouselItemsSchema.id, item[0].id));

    await log(`Has updated carousel item '${item[0].name}' (${item[0].id})`, currentUserId)
    await mqtt.SendCarouselRefresh(String(item[0].carousel))
    res.status(201).json({ message: `Carousel item '${item[0].name}' has been updated`, carousel: item[0].id });
}

export default {
    getCarouselItemById,
    getAllCarousels,
    getCarousel,
    getAllCarouselsAndItemsForATimetable,
    createCarousel,
    createCarouselItem,
    deleteCarousel,
    deleteCarouselItem,
    updateCarousel,
    updateCarouselItem
};