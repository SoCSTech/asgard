import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema, users as userSchema, carousels as carouselSchema, carouselItems as carouselItemsSchema } from '@/db/schema';
import { eq, and, or, asc } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { log } from "@/utils/log";
const dotenv = require('dotenv');
dotenv.config();

// Schema of New Timetable
const newTimetable = {
    spaceCode: timetableSchema.spaceCode,
    name: timetableSchema.name,
    capacity: timetableSchema.capacity,
    canCombine: timetableSchema.canCombine || false,
    combinedPartnerId: timetableSchema.combinedPartnerId || null,
    dataSource: timetableSchema.dataSource || null,
}

export const convertSpaceCodeToTimetableId = async (timetableId: string) => {
    const isSpaceCode: RegExp = /^[A-Za-z]{3}\d{4}$/; // Three Letters - 4 Numbers
    if (isSpaceCode.test(timetableId)) {
        const timetable = await db.select().from(timetableSchema)
            .where(and(
                eq(timetableSchema.spaceCode, String(timetableId)),
                eq(timetableSchema.isDeleted, false)
            ));

        if (timetable.length !== 1){
            console.error("Couldn't find timetable for that Id???")
            return "null";
        }

        return timetable[0].id;
    }
    return timetableId;
}

const getTimetableById = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    const timetable = await db.select().from(timetableSchema)
        .where(
            and(
                or(
                    eq(timetableSchema.id, String(timetableId)),
                    eq(timetableSchema.spaceCode, String(timetableId)),
                ),
                eq(timetableSchema.isDeleted, false))
        );

    res.json({ timetables: timetable });
};

const getAllTimetables = async (req: Request, res: Response, next: NextFunction) => {
    const timetables = await db.select()
        .from(timetableSchema)
        .where(eq(timetableSchema.isDeleted, false))
        .orderBy(asc(timetableSchema.spaceCode));

    res.json({ timetables: timetables });
};

const getAllDeletedTimetables = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to view deleted timetables" })
        return
    }

    const timetables = await db.select()
        .from(timetableSchema)
        .where(eq(timetableSchema.isDeleted, true))
        .orderBy(asc(timetableSchema.spaceCode));

    res.json({ timetables: timetables });
};

// POST: { "spaceCode": "INB1305", "name": "Games Lab", "capacity": 30 }
// POST: { "spaceCode": "INB1102", "name": "Computing Lab 1A", "capacity": 77, "canCombine": true, "combinedPartnerId": "<uuid>"  }
const createTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create timetables" })
        return
    }

    if (!!req.body.canCombine) {
        // Check the user doesn't already exist
        const partnerRoom = await db.select().from(timetableSchema)
            .where(
                eq(timetableSchema.id, String(req.body.combinedPartnerId))
            );

        if (partnerRoom.length != 1) {
            res.status(409).json({ "message": "Cannot combine with that room, does it exist in the list? And are you giving me the ID not the space code?" })
            return;
        }
    }

    // Check if timetable with that space code already exists
    const oldTimetable = await db.select().from(timetableSchema).where(
        eq(timetableSchema.spaceCode, String(req.body.spaceCode)),
    )

    if (oldTimetable.length !== 0) {
        res.status(409).json({ "message": "A timetable with that space code already exists, perhaps it has been disabled?" })
        return;
    }

    // Push to DB new timetable
    const timetable = await db.insert(timetableSchema).values({
        spaceCode: req.body.spaceCode,
        name: req.body.name,
        capacity: req.body.capacity,
        canCombine: req.body.canCombine || false,
        combinedPartnerId: req.body.combinedPartnerId || null,
        dataSource: req.body.dataSource || null,
    })

    await log(`Has created timetable with name ${req.body.name} (${req.body.spaceCode})`, currentUserId)
    
    const newTimetablesId = await convertSpaceCodeToTimetableId(req.body.spaceCode)
    console.log(newTimetablesId)

    const newCarousel = await db.insert(carouselSchema).values({
        timetable: newTimetablesId,
        modifiedBy: getUserIdFromJWT(token)
    });

    const theCarousel = await db.select().from(carouselSchema).where(
        eq(carouselSchema.timetable, newTimetablesId),
    )

    const newItem = await db.insert(carouselItemsSchema).values({
        carousel: theCarousel[0].id,
        modifiedBy: getUserIdFromJWT(token),
        type: 'TIMETABLE',
        name: "Timetable",
        durationMs: 10000,
        order: 0
    });

    res.status(201).json({ "message": "Timetable has been added", "spaceCode": req.body.spaceCode, "timetableId": newTimetablesId });
};

const deleteTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete timetables" })
        return
    }

    let timetableId: string = req.params.id
    const timetables = await db.select().from(timetableSchema)
        .where(
            and(
                or(
                    eq(timetableSchema.id, String(timetableId)),
                    eq(timetableSchema.spaceCode, String(timetableId)),
                ),
                eq(timetableSchema.isDeleted, false))
        );

    if (timetables.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable to delete" })
        return
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({ isDeleted: true })
        .where(eq(timetableSchema.id, timetables[0].id));

    await log(`Has deleted timetable with id ${timetableId}`, currentUserId)
    res.status(201).json({ message: "Timetable has been deleted", timetable: timetableId });
};

const undeleteTimetable = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to reactivate timetables" })
        await log(`Has tried to reactivated timetable with id ${timetableId}`, currentUserId)
        return
    }

    const timetable = await db.select().from(timetableSchema)
        .where(
            and(
                or(
                    eq(timetableSchema.id, String(timetableId)),
                    eq(timetableSchema.spaceCode, String(timetableId)),
                ),
                eq(timetableSchema.isDeleted, true))
        );

    if (timetable.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable or timetable is already active" })
        return
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({ isDeleted: false })
        .where(eq(timetableSchema.id, timetable[0].id));

    await log(`Has reactivated timetable with id ${timetableId}`, currentUserId)
    res.status(201).json({ message: "Timetable has been reactivated", timetable: timetable[0].id });
};

const updateTimetable = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update timetables" })
        return
    }

    const timetable = await db.select().from(timetableSchema)
        .where(
            or(
                eq(timetableSchema.id, String(timetableId)),
                eq(timetableSchema.spaceCode, String(timetableId)),
            )
        );

    if (timetable.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable" })
        return
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({
            name: req.body.name || timetable[0].name,
            spaceCode: req.body.spaceCode || timetable[0].spaceCode,
            capacity: req.body.capacity || timetable[0].capacity,
            canCombine: req.body.canCombine || timetable[0].canCombine,
            combinedPartnerId: req.body.combinedPartnerId || timetable[0].combinedPartnerId,
            isDeleted: req.body.isDeleted || timetable[0].isDeleted,
            dataSource: req.body.dataSource || timetable[0].dataSource
        })
        .where(eq(timetableSchema.id, timetable[0].id));

    await log(`Has updated timetable with id ${timetableId}`, currentUserId)
    res.status(201).json({ message: `Timetable for ${timetable[0].spaceCode} has been updated`, timetable: timetable[0].id });
};

export default { getTimetableById, getAllTimetables, getAllDeletedTimetables, createTimetable, deleteTimetable, undeleteTimetable, updateTimetable };
