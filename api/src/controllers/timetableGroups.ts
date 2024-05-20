import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema, timetableGroups as groupsSchema, timetableGroupMembers as groupMembersSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { dateToString } from "@/utils/date";
import { log } from "@/utils/log";
const dotenv = require('dotenv');
dotenv.config();

const getAllTimetableGroups = async (req: Request, res: Response, next: NextFunction) => {
    const groups = await db.select().from(groupsSchema)
        .leftJoin(groupMembersSchema, eq(groupsSchema.id, groupMembersSchema.groupId))
        .leftJoin(timetableSchema, eq(groupMembersSchema.timetableId, timetableSchema.id))
        .where(eq(groupsSchema.isDeleted, false))

    res.json({ groups: groups });
}

// POST: { "name": "Today's Timetable", "subtitle": "School of Computer Science" }
const createTimetableGroup = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create timetables" })
        return
    }

    // Push to DB new timetable
    try {
        const group = await db.insert(groupsSchema).values({
            internalName: req.body.internalName,
            name: req.body.name,
            subtitle: req.body.subtitle,
            modifiedBy: currentUserId,
            displayInfoPane: req.body.displayInfoPane || false,
            infoPaneText: req.body.infoPaneText || null,
            infoPaneQR: req.body.infoPaneQR || false,
            infoPaneQRUrl: req.body.infoPaneQRUrl || ""
        })
    } catch (error) {
        res.status(406).json({ "message": "Timetable group could not be added - check the data and try again." });    
    }

    await log(`Has created timetable group with name ${req.body.internalName}`, currentUserId)

    res.status(201).json({ "message": "Timetable group has been added" });
};

const updateTimetableGroup = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update timetable groups" })
        return
    }

    let groupId: string = req.params.id
    const groups = await db.select().from(groupsSchema)
        .where(
            eq(groupsSchema.id, String(groupId))
        );

    if (groups.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable group to update" })
        return
    }

    let currentTime: Date = new Date();
    let currentTimeStr = dateToString(currentTime);

    const updatedGroups = await db.update(groupsSchema)
        .set({
            name: req.body.name || groups[0].name,
            subtitle: req.body.subtitle || groups[0].subtitle,
            lastModified: currentTimeStr,
            modifiedBy: currentUserId,
        })
        .where(eq(timetableSchema.id, groups[0].id));

    await log(`Has updated timetable group with id ${groupId}`, currentUserId)

    res.status(201).json({ message: "Timetable group has been updated", group: groups[0].id });
};

const deleteTimetableGroup = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete timetables" })
        return
    }

    // let timetableId: string = req.params.id
    // const timetables = await db.select().from(timetableSchema)
    //     .where(
    //         and(
    //             or(
    //                 eq(timetableSchema.id, String(timetableId)),
    //                 eq(timetableSchema.spaceCode, String(timetableId)),
    //             ),
    //             eq(timetableSchema.isDeleted, false))
    //     );

    // if (timetables.length !== 1) {
    //     res.status(404).json({ "message": "Cannot find timetable to delete" })
    //     return
    // }

    // const updatedTimetable = await db.update(timetableSchema)
    //     .set({ isDeleted: true })
    //     .where(eq(timetableSchema.id, timetables[0].id));

    // // await log(`Has updated timetable group with id ${groupId}`, currentUserId)

    // res.status(201).json({ message: "Timetable has been deleted", timetable: timetableId });
    res.status(420)
};

const addTimetableToGroup = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    // const token = getTokenFromAuthCookie(req, res)
    // const currentUserId = getUserIdFromJWT(token);
    // if (await isUserATechnician(currentUserId) == false) {
    //     res.status(401).json({ "message": "You don't have permission to update timetables" })
    //     return
    // }

    // const timetable = await db.select().from(timetableSchema)
    //     .where(
    //         or(
    //             eq(timetableSchema.id, String(timetableId)),
    //             eq(timetableSchema.spaceCode, String(timetableId)),
    //         )
    //     );

    // if (timetable.length !== 1) {
    //     res.status(404).json({ "message": "Cannot find timetable" })
    //     return
    // }

    // const updatedTimetable = await db.update(timetableSchema)
    //     .set({
    //         name: req.body.name || timetable[0].name,
    //         spaceCode: req.body.spaceCode || timetable[0].spaceCode,
    //         capacity: req.body.capacity || timetable[0].capacity,
    //         canCombine: req.body.canCombine || timetable[0].canCombine,
    //         combinedPartnerId: req.body.combinedPartnerId || timetable[0].combinedPartnerId,
    //         isDeleted: req.body.isDeleted || timetable[0].isDeleted
    //     })
    //     .where(eq(timetableSchema.id, timetable[0].id));

    // // await log(`Has updated timetable group with id ${groupId}`, currentUserId)

    // res.status(201).json({ message: `Timetable for ${timetable[0].spaceCode} has been updated`, timetable: timetable[0].id });
    res.status(420)
};

const removeTimetableFromGroup = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.params.id

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update timetables" })
        return
    }

    // const timetable = await db.select().from(timetableSchema)
    //     .where(
    //         or(
    //             eq(timetableSchema.id, String(timetableId)),
    //             eq(timetableSchema.spaceCode, String(timetableId)),
    //         )
    //     );

    // if (timetable.length !== 1) {
    //     res.status(404).json({ "message": "Cannot find timetable" })
    //     return
    // }

    // const updatedTimetable = await db.update(timetableSchema)
    //     .set({
    //         name: req.body.name || timetable[0].name,
    //         spaceCode: req.body.spaceCode || timetable[0].spaceCode,
    //         capacity: req.body.capacity || timetable[0].capacity,
    //         canCombine: req.body.canCombine || timetable[0].canCombine,
    //         combinedPartnerId: req.body.combinedPartnerId || timetable[0].combinedPartnerId,
    //         isDeleted: req.body.isDeleted || timetable[0].isDeleted
    //     })
    //     .where(eq(timetableSchema.id, timetable[0].id));

    // // await log(`Has updated timetable group with id ${groupId}`, currentUserId)

    // res.status(201).json({ message: `Timetable for ${timetable[0].spaceCode} has been updated`, timetable: timetable[0].id });
    res.status(420)
};


const getTimetableGroupById = async (req: Request, res: Response, next: NextFunction) => {
    //     let groupId: string = req.params.id

    //     const groups = await db.select().from(groupsSchema)
    //         .leftJoin(groupMembersSchema, eq(groupsSchema.id, groupMembersSchema.groupId))
    //         .leftJoin(timetableSchema, eq(groupMembersSchema.timetableId, timetableSchema.id))
    //         .where(
    //             and(
    //                 eq(groupsSchema.id, String(groupId)),
    //                 eq(timetableSchema.isDeleted, false)
    //             )
    //         )
    //     res.json({ groups: groups });
    // };

    // const getAllTimetableGroups = async (req: Request, res: Response, next: NextFunction) => {
    //     const groups = await db.select().from(groupsSchema)
    //         .leftJoin(groupMembersSchema, eq(groupsSchema.id, groupMembersSchema.groupId))
    //         .leftJoin(timetableSchema, eq(groupMembersSchema.timetableId, timetableSchema.id))
    //         .where(eq(timetableSchema.isDeleted, false))

    //     res.json({ groups: groups });
    res.status(420)
};



export default { getAllTimetableGroups, createTimetableGroup };