import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema, timetableGroups as groupsSchema, timetableGroupMembers as groupMembersSchema } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { dateToString } from "@/utils/date";
import { log } from "@/utils/log";
import { convertSpaceCodeToTimetableId } from "./timetables";
import { defaultBoolean } from "@/utils/defaultValues";
const dotenv = require('dotenv');
dotenv.config();

const getAllTimetableGroups = async (req: Request, res: Response, next: NextFunction) => {
    const groups = await db.select().from(groupsSchema)
        .where(eq(groupsSchema.isDeleted, false))

    res.json({ groups: groups });
}

// POST: { "name": "Today's Timetable", "subtitle": "School of Computer Science" }
const createTimetableGroup = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to create timetable groups" })
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

    console.log(defaultBoolean(req.body.isDeleted, groups[0].isDeleted))

    const updatedGroup = await db.update(groupsSchema)
        .set({
            internalName: req.body.internalName || groups[0].internalName,
            name: req.body.name || groups[0].name,
            subtitle: req.body.subtitle || groups[0].subtitle,
            modifiedBy: currentUserId,
            lastModified: currentTimeStr,
            displayInfoPane: defaultBoolean(req.body.displayInfoPane, groups[0].displayInfoPane),
            infoPaneText: req.body.infoPaneText || groups[0].infoPaneText,
            infoPaneQR: defaultBoolean(req.body.infoPaneQR, groups[0].infoPaneQR),
            infoPaneQRUrl: req.body.infoPaneQRUrl || groups[0].infoPaneQRUrl,
            isDeleted: defaultBoolean(req.body.isDeleted, groups[0].isDeleted)
        })
        .where(eq(groupsSchema.id, groups[0].id));

    await log(`Has updated timetable group with id ${groupId}`, currentUserId)

    res.status(201).json({ message: "Timetable group has been updated", group: groups[0].id });
};

const deleteTimetableGroup = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to delete timetable groups" })
        return
    }

    let groupId: string = req.params.id
    const groups = await db.select().from(groupsSchema)
        .where(
            and(
                or(
                    eq(groupsSchema.id, String(groupId)),
                ),
                eq(groupsSchema.isDeleted, false))
        );

    if (groups.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable group to delete" })
        return
    }

    const updatedGroup = await db.update(groupsSchema)
        .set({ isDeleted: true })
        .where(eq(groupsSchema.id, groups[0].id));

    await log(`Has deleted timetable group with id ${groupId}`, currentUserId)

    res.status(201).json({ message: "Timetable group has been deleted", group: groupId });
};

const addTimetableToGroup = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = req.body.timetableId
    let groupId: string = req.body.groupId

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update timetable groups" })
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

    const group = await db.select().from(groupsSchema)
        .where(
            or(
                eq(groupsSchema.id, String(groupId))
            )
        );

    if (group.length !== 1) {
        res.status(404).json({ "message": "Cannot find group" })
        return
    }

    const sameMemberWeAreAdding = await db.select().from(groupMembersSchema)
        .where(
            and(
                eq(groupMembersSchema.groupId, String(group[0].id)),
                eq(groupMembersSchema.timetableId, String(timetable[0].id))
            )
        );

    if (sameMemberWeAreAdding.length !== 0) {
        res.status(409).json({ "message": "Timetable is already added to group" })
        return
    }

    const oldMembers = await db.select().from(groupMembersSchema)
        .where(
            eq(groupMembersSchema.groupId, String(group[0].id))
        );

    const newMember = await db.insert(groupMembersSchema)
        .values({
            groupId: group[0].id,
            timetableId: timetable[0].id,
            order: oldMembers.length
        })

    await log(`Has added timetable ${timetable[0].id} to group ${group[0].id}`, currentUserId)

    res.status(201).json({ message: `Timetable ${timetable[0].spaceCode} has been added to group ${group[0].id}`, group: group[0].id });
};

const removeTimetableFromGroup = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update timetable groups" })
        return
    }

    const timetable = await db.select().from(timetableSchema)
        .where(
            and(
                or(
                    eq(timetableSchema.id, String(req.body.timetableId)),
                    eq(timetableSchema.spaceCode, String(req.body.timetableId)),
                ),
                eq(timetableSchema.isDeleted, false)
            )
        );

    if (timetable.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable" })
        return
    }

    const group = await db.select().from(groupsSchema)
    .where(
        and(
            eq(groupsSchema.id, String(req.body.groupId)),
            eq(groupsSchema.isDeleted, false)
        )
    );
    
    if (group.length !== 1) {
        res.status(404).json({ "message": "Cannot find timetable group" })
        return
    }

    try {
        const deletedMembership = await db.delete(groupMembersSchema)
            .where(and(
                eq(groupMembersSchema.timetableId, timetable[0].id),
                eq(groupMembersSchema.groupId, group[0].id)
            ))
    } catch (error) {
        res.status(500).json({ message: "Something went wrong when trying to remove timetable from group." })
        return
    }
    
    await log(`Has removed timetable ${timetable[0].spaceCode} from group with id ${group[0].id}`, currentUserId)

    res.status(201).json({ message: `Timetable ${timetable[0].spaceCode} has been removed from group ${group[0].internalName}`, group: group[0].id });
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



export default { getAllTimetableGroups, createTimetableGroup, updateTimetableGroup, deleteTimetableGroup, addTimetableToGroup, removeTimetableFromGroup };