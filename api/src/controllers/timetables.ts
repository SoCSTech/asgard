import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { generateSecureCode, getUserIdFromJWT } from "@/utils/auth";
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
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

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
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

    const timetables = await db.select()
        .from(timetableSchema)
        .where(eq(timetableSchema.isDeleted, false));

    res.json({ timetables: timetables });
};

// POST: { "spaceCode: "INB1305", "name": "Games Lab", "capacity": 30 }
// POST: { "spaceCode: "INB1102", "name": "Computing Lab 1A", "capacity": 77, "canCombine": true, "combinedPartnerId": "<uuid>"  }
const createTimetable = async (req: Request, res: Response, next: NextFunction) => {
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

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
    let timetableId: string = req.params.id

    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

    const timetables = await db.select().from(timetableSchema)
        .where(
            and(
                or(
                    eq(timetableSchema.id, String(timetableSchema)),
                    eq(timetableSchema.spaceCode, String(timetableSchema)),
                ),
                eq(timetableSchema.isDeleted, false))
        );

    if (timetables.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable to delete" })
    }

    const updatedTimetable = await db.update(timetableSchema)
        .set({ isDeleted: true })
        .where(eq(timetableSchema.id, timetables[0].id));

    res.status(201).json({ message: "Timetable has been deleted", timetable: timetableId});
};

const undeleteTimetable = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

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

export default { getTimetableById, getAllTimetables, createTimetable, deleteTimetable, undeleteTimetable };