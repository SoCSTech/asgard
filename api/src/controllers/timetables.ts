import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema, users as userSchema, carousels as carouselSchema, carouselItems as carouselItemsSchema, userTimetables as userTimetablesSchema } from '@/db/schema';
import { eq, and, or, asc } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { log } from "@/utils/log";
const dotenv = require('dotenv');
dotenv.config();

// Schema of New Timetable
const newTimetable = {
    spaceCode: timetableSchema.spaceCode,
    lab: timetableSchema.lab || null,
    name: timetableSchema.name,
    capacity: timetableSchema.capacity,
    canCombine: timetableSchema.canCombine || false,
    combinedPartnerId: timetableSchema.combinedPartnerId || null,
    dataSource: timetableSchema.dataSource || null,
}

type TimetableWithPartner = {
    id: string;
    name: string | null;
    spaceCode: string | null;
    lab: string | null;
    creationDate: Date;
    capacity: number | null;
    canCombine: boolean;
    combinedPartnerId: string | null;
    isDeleted: boolean;
    isFavourite?: boolean;
    dataSource: "MANUAL" | "UOL_TIMETABLE" | "ICAL" | "MS_BOOKINGS";
    combinedPartnerSpaceCode?: string;
};

export const convertTimetableIdToSpaceCode = async (spaceCode: string) => {
    const timetable = await db.select().from(timetableSchema)
        .where(and(
            eq(timetableSchema.id, String(spaceCode)),
            eq(timetableSchema.isDeleted, false)
        ));

    if (timetable.length !== 1) {
        console.error("Couldn't find timetable for that Id???")
        return "null";
    }

    return timetable[0].spaceCode;
}

export const convertSpaceCodeToTimetableId = async (timetableId: string) => {
    const isSpaceCode: RegExp = /^[A-Za-z]{3}\d{4}$/; // Three Letters - 4 Numbers
    if (isSpaceCode.test(timetableId)) {
        const timetable = await db.select().from(timetableSchema)
            .where(
                eq(timetableSchema.spaceCode, String(timetableId))
            );

        if (timetable.length !== 1) {
            console.error("Couldn't find timetable for that Id???")
            return "null";
        }

        return timetable[0].id;
    }
    return timetableId;
}

const getMyTimetables = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res);
    const currentUserId = getUserIdFromJWT(token);

    try {
        const timetables = await db.select()
            .from(userTimetablesSchema)
            .where(eq(userTimetablesSchema.user, currentUserId))
            .leftJoin(timetableSchema, eq(userTimetablesSchema.timetable, timetableSchema.id))
            .orderBy(asc(timetableSchema.spaceCode));

        /* timetables [{
            user_timetable: {
                user: "josh",
                timetable: "inb1305"
            },
            timetable: {
                name: "Games Lab",
                spaceCode: "INB1305"
            }
        }]
        */

        let cleanedTimetables: Array<any> = [];
        timetables.forEach((tt) => {
            if (tt.timetables) {
                cleanedTimetables.push(tt.timetables);
            }
        });

        /* cleanedTimetables [{
            name: "Games Lab",
            spaceCode: "INB1305"
        }]
        */

        res.json({ timetables: cleanedTimetables });

    } catch (error) {
        await log(`Caught error while trying to get my timetables ${error}`, currentUserId)
        next(error); // Pass any errors to the next middleware
    }
};

const addMyTimetables = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to add timetables to users" })
        return
    }

    const timetableId = await convertSpaceCodeToTimetableId(req.body.timetable)
    console.log(timetableId)

    // Allow for username to be "me"
    let userId: string = req.body.user
    if (userId == "me") {
        userId = currentUserId
    }

    // Check if user exists
    const user = await db.select().from(userSchema).where(or(
        eq(userSchema.id, String(userId)),
        eq(userSchema.username, String(userId)),
        eq(userSchema.email, String(userId)),
    ))

    if (user.length !== 1) {
        res.status(404).json({ "message": "User does not exist" })
        return;
    }

    // Check if user has access/"my" to that timetable already
    const oldLink = await db.select().from(userTimetablesSchema)
        .where(and(
            eq(userTimetablesSchema.user, user[0].id),
            eq(userTimetablesSchema.timetable, timetableId)
        ))

    if (oldLink.length !== 0) {
        res.status(409).json({ "message": "User has access to that timetable already!" })
        return;
    }

    // Push to DB new timetable
    const link = await db.insert(userTimetablesSchema).values({
        timetable: timetableId,
        user: user[0].id,
    })

    await log(`Linked user ${user[0].username} with timetable ${timetableId}`, currentUserId)
    res.status(201).json({ message: `Linked user ${user[0].username} with timetable ${timetableId}` });
};

const removeMyTimetables = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to add timetables to users" })
        return
    }

    const timetableId = await convertSpaceCodeToTimetableId(req.body.timetable)

    // Allow for username to be "me"
    let userId: string = req.body.user
    if (userId == "me") {
        userId = currentUserId
    }

    // Check if user exists
    const user = await db.select().from(userSchema).where(or(
        eq(userSchema.id, String(userId)),
        eq(userSchema.username, String(userId)),
        eq(userSchema.email, String(userId)),
    ))

    if (user.length !== 1) {
        res.status(404).json({ "message": "User does not exist" })
        return;
    }

    // Check if user has access/"my" to that timetable already
    const oldLink = await db.select().from(userTimetablesSchema)
        .where(and(
            eq(userTimetablesSchema.user, user[0].id),
            eq(userTimetablesSchema.timetable, timetableId)
        ))

    if (oldLink.length !== 1) {
        res.status(409).json({ "message": "User does not have access to that timetable anyway!" })
        return;
    }

    // Push to DB new timetable
    const link = await db.delete(userTimetablesSchema).where(and(
        eq(userTimetablesSchema.timetable, timetableId),
        eq(userTimetablesSchema.user, user[0].id),
    ))

    await log(`Unlinked user ${user[0].username} with timetable ${timetableId}`, currentUserId)
    res.status(201).json({ message: `Unlinked user ${user[0].username} with timetable ${timetableId}` });
};

const getTimetableById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let timetableIsFavourite = false
        const timetableId: string = req.params.id;

        // If the user is logged in check if they are,
        // check if they have this timetable as a favourite
        // if they do add it to the return value
        if (req.headers.authorization) {
            const token = getTokenFromAuthCookie(req, res)
            const currentUserId = getUserIdFromJWT(token);

            const link = await db.select().from(userTimetablesSchema)
                .where(and(
                    eq(userTimetablesSchema.user, currentUserId),
                    eq(userTimetablesSchema.timetable, timetableId)
                ))

            if (link.length == 1) {
                timetableIsFavourite = true
            }
        }

        const timetables: TimetableWithPartner[] = await db.select().from(timetableSchema)
            .where(
                or(
                    eq(timetableSchema.id, String(timetableId)),
                    eq(timetableSchema.spaceCode, String(timetableId)),
                )
            );

        const returnedTimetables: TimetableWithPartner[] = await Promise.all(timetables.map(async (tt) => {
            const extendedTimetable = { ...tt } as TimetableWithPartner;
            extendedTimetable.isFavourite = timetableIsFavourite
            if (tt.combinedPartnerId) {
                extendedTimetable.combinedPartnerSpaceCode = await convertTimetableIdToSpaceCode(tt.combinedPartnerId);
            }
            return extendedTimetable;
        }));

        res.json({ timetables: returnedTimetables });
    } catch (error) {
        next(error); // Pass the error to the next middleware (usually an error handler)
    }
};

const getAllTimetables = async (req: Request, res: Response, next: NextFunction) => {
    const timetables = await db.select()
        .from(timetableSchema)
        .where(eq(timetableSchema.isDeleted, false))
        .orderBy(asc(timetableSchema.spaceCode));

    res.json({ timetables: timetables });
};

const getTimetablesByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const enumValues = timetableSchema.dataSource.enumValues;
        type EnumValuesType = (typeof enumValues)[number];

        // Convert the requested type to upper case
        let typeRequested = (req.params.type as string).toUpperCase();

        // Check if the requested type is valid
        if (!enumValues.includes(typeRequested as EnumValuesType)) {
            throw new Error('Invalid type requested');
        }

        // Convert the requested type to the correct enum type
        let typeToSelect = typeRequested as EnumValuesType;

        const timetables = await db.select()
            .from(timetableSchema)
            .where(and(
                eq(timetableSchema.isDeleted, false),
                eq(timetableSchema.dataSource, typeToSelect)
            ))
            .orderBy(asc(timetableSchema.spaceCode));

        res.json({ timetables: timetables });

    } catch (error) {
        res.status(406).json({ "message": "Invalid type requested!" });
        return;
    }
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
        lab: req.body.lab || null,
        name: req.body.name,
        capacity: req.body.capacity,
        canCombine: req.body.canCombine || false,
        combinedPartnerId: req.body.combinedPartnerId || null,
        dataSource: req.body.dataSource || "MANUAL",
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

    const updatedCarousel = await db.update(carouselSchema)
        .set({ isDeleted: true })
        .where(eq(carouselSchema.timetable, timetables[0].id))

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

    const updatedCarousel = await db.update(carouselSchema)
        .set({ isDeleted: false })
        .where(eq(carouselSchema.timetable, timetable[0].id))

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
            lab: req.body.lab || timetable[0].lab,
            capacity: req.body.capacity || timetable[0].capacity,
            canCombine: req.body.canCombine || timetable[0].canCombine,
            combinedPartnerId: req.body.combinedPartnerId || timetable[0].combinedPartnerId,
            isDeleted: req.body.isDeleted || timetable[0].isDeleted,
            dataSource: req.body.dataSource || timetable[0].dataSource,
            defaultColour: req.body.defaultColour || timetable[0].defaultColour,
        })
        .where(eq(timetableSchema.id, timetable[0].id));

    await log(`Has updated timetable with id ${timetableId}`, currentUserId)
    res.status(201).json({ message: `Timetable for ${timetable[0].spaceCode} has been updated`, timetable: timetable[0].id });
};

export default { getTimetablesByType, getMyTimetables, addMyTimetables, removeMyTimetables, getTimetableById, getAllTimetables, getAllDeletedTimetables, createTimetable, deleteTimetable, undeleteTimetable, updateTimetable };
