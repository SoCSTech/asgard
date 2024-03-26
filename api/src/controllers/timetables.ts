import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema, users as userSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { getUserIdFromJWT, verifyUserAuthToken } from "@/utils/auth";
const dotenv = require('dotenv');
dotenv.config();

// Schema of New Timetable
const newTimetable = {
    spaceCode: timetableSchema.spaceCode,
    name: timetableSchema.name,
    capacity: timetableSchema.capacity,
    canCombine: timetableSchema.canCombine || false,
    combinedPartnerId: timetableSchema.combinedPartnerId || null
}

const getTimetableById = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)

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
    const token = verifyUserAuthToken(req, res)

    const timetables = await db.select()
        .from(timetableSchema)
        .where(eq(timetableSchema.isDeleted, false));

    res.json({ timetables: timetables });
};

// POST: { "spaceCode": "INB1305", "name": "Games Lab", "capacity": 30 }
// POST: { "spaceCode": "INB1102", "name": "Computing Lab 1A", "capacity": 77, "canCombine": true, "combinedPartnerId": "<uuid>"  }
const createTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)

    if (req.body.canCombine) {
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

    // Push to DB new timetable
    const timetable = await db.insert(timetableSchema).values({
        spaceCode: req.body.spaceCode,
        name: req.body.name,
        capacity: req.body.capacity,
        canCombine: req.body.canCombine || false,
        combinedPartnerId: req.body.combinedPartnerId || null
    })

    res.status(201).json({ "message": "Timetable has been added", "spaceCode": req.body.spaceCode });
};

const deleteTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const token = verifyUserAuthToken(req, res)

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
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({ isDeleted: true })
        .where(eq(timetableSchema.id, timetables[0].id));

    res.status(201).json({ message: "Timetable has been deleted", timetable: timetableId });
};

const undeleteTimetable = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    const token = verifyUserAuthToken(req, res)

    // This is the id of the person who is logged in sending the invite out.
    const currentUserId = getUserIdFromJWT(token);

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
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({ isDeleted: false })
        .where(eq(timetableSchema.id, timetable[0].id));

    res.status(201).json({ message: "Timetable has been reactivated", timetable: timetable[0].id });
};

const updateTimetable = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    const token = verifyUserAuthToken(req, res)
    const currentUserId = getUserIdFromJWT(token);

    const admin = await db.select({ role: userSchema.role }).from(userSchema)
        .where(
            and(
                eq(userSchema.id, String(currentUserId)),
                eq(userSchema.isDeleted, false))
        );

    if (admin[0].role !== "TECHNICIAN") {
        res.status(401).json({ "message": "You don't have permission to reactivate user accounts" })
        return
    }

    const timetable = await db.select().from(timetableSchema)
        .where(
            and(
                eq(timetableSchema.id, String(timetableId)),
                eq(timetableSchema.spaceCode, String(timetableId)),
            )
        );

    if (timetable.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable" })
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({
            name: req.body.name || timetable[0].name,
            spaceCode: req.body.spaceCode || timetable[0].spaceCode,
            capacity: req.body.capacity || timetable[0].capacity,
            canCombine: req.body.canCombine || timetable[0].canCombine,
            combinedPartnerId: req.body.combinedPartnerId || timetable[0].combinedPartnerId,
            isDeleted: req.body.isDeleted || timetable[0].isDeleted
        })
        .where(eq(timetableSchema.id, timetable[0].id));

    res.status(201).json({ message: `Timetable for ${timetable[0].spaceCode} has been updated`, timetable: timetable[0].id });
};

export default { getTimetableById, getAllTimetables, createTimetable, deleteTimetable, undeleteTimetable, updateTimetable };