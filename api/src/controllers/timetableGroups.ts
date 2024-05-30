import e, { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { timetables as timetableSchema, timetableGroups as groupsSchema, timetableGroupMembers as groupMembersSchema, events as eventsSchema } from '@/db/schema';
import { eq, and, or, lt, gt } from 'drizzle-orm';
import { getUserIdFromJWT, getTokenFromAuthCookie } from "@/utils/auth";
import { isUserATechnician } from "@/utils/users";
import { dateTimeToStringUtc, dateToString } from "@/utils/date";
import { log } from "@/utils/log";
import { defaultBoolean } from "@/utils/defaultValues";
import { convertSpaceCodeToTimetableId } from "@/controllers/timetables";
const dotenv = require('dotenv');
dotenv.config();

// > CRUD Ops \/
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
            displayInfoPane: defaultBoolean(req.body.displayInfoPane, false),
            infoPaneText: req.body.infoPaneText || null,
            displayInfoPaneQR: defaultBoolean(req.body.displayInfoPaneQR, false),
            infoPaneQRUrl: req.body.infoPaneQRUrl || "",
            verbAvailable: req.body.verbAvailable || "free",
            verbUnavailable: req.body.verbUnavailable || "in use",
            object: req.body.object || "room"
        })
    } catch (error) {
        res.status(406).json({ "message": "Timetable group could not be added - check the data and try again." });
        return
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

    const updatedGroup = await db.update(groupsSchema)
        .set({
            internalName: req.body.internalName || groups[0].internalName,
            name: req.body.name || groups[0].name,
            subtitle: req.body.subtitle || groups[0].subtitle,
            modifiedBy: currentUserId,
            lastModified: currentTimeStr,
            displayInfoPane: defaultBoolean(req.body.displayInfoPane, groups[0].displayInfoPane),
            infoPaneText: req.body.infoPaneText || groups[0].infoPaneText,
            displayInfoPaneQR: defaultBoolean(req.body.displayInfoPaneQR, groups[0].displayInfoPaneQR),
            infoPaneQRUrl: req.body.infoPaneQRUrl || groups[0].infoPaneQRUrl,
            isDeleted: defaultBoolean(req.body.isDeleted, groups[0].isDeleted),
            verbAvailable: req.body.verbAvailable || groups[0].verbAvailable,
            verbUnavailable: req.body.verbUnavailable || groups[0].verbUnavailable,
            object: req.body.object || groups[0].object
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
// > CRUD Ops /\

/*
Checks if timetable and group exist
Check if the match already exists...
If exist separately then add to group list
*/
const addTimetableToGroup = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = await convertSpaceCodeToTimetableId(req.body.timetableId)
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
            order: oldMembers.length,
            location: req.body.location || null
        })

    await log(`Has added timetable ${timetable[0].id} to group ${group[0].id}`, currentUserId)

    res.status(201).json({ message: `Timetable ${timetable[0].spaceCode} has been added to group ${group[0].id}`, group: group[0].id });
};

/*
Deletes timetable from group
*/
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

const updateTimetableGroupMember = async (req: Request, res: Response, next: NextFunction) => {
    let timetableId: string = await convertSpaceCodeToTimetableId(req.body.timetableId)
    let groupId: string = req.body.groupId

    const token = getTokenFromAuthCookie(req, res)
    const currentUserId = getUserIdFromJWT(token);
    if (await isUserATechnician(currentUserId) == false) {
        res.status(401).json({ "message": "You don't have permission to update timetable groups" })
        return
    }

    try {
        const oldGrouping = await db.select().from(groupMembersSchema)
            .where(and(
                eq(groupMembersSchema.groupId, groupId),
                eq(groupMembersSchema.timetableId, timetableId)
            ))

        if (oldGrouping.length !== 1) {
            res.status(400).json({ message: "Couldn't find matching group combination" })
            return
        }

        const updatedGroup = await db.update(groupMembersSchema)
            .set({
                order: req.body.order || oldGrouping[0].order,
                location: req.body.location || oldGrouping[0].location
            })
            .where(and(
                eq(groupMembersSchema.timetableId, timetableId),
                eq(groupMembersSchema.groupId, groupId),
            ));

        res.status(201).json({ message: "Updated timetable grouping" })
        return
    } catch (error) {
        res.status(500).json({ message: "Couldn't update timetable grouping" })
        return
    }
}

/*
Gets a in a single requests all the data needed to make a multi-room overview timetable screen,
This is useful for a building lobby or outside a bookable room with booths.
This will remove the need to hard code multi-views... And allow for quick changes.
*/
const getTimetableGroupById = async (req: Request, res: Response, next: NextFunction) => {
    let groupId: string = req.params.id

    /*
    I am doing this in three queries:
        1. get the group and its meta data
        2. get all the timetables that are in that group.
        3. for all the timetables, get their events

    This is because I am wanting the data to look like:
    {
        id: blah,
        internalName: "INB 1st Floor Landing",
        name: "Today's timetable",
        subtitle: "school of computer science",
        timetables: [
            {
                spaceCode: "INB1102",
                events: [
                    { name: "Workshop: Programming Fundamentals" },
                    { name: "Workshop: Maths for Computer Science" }
                ]
            },
            {
                spaceCode: "INB1301",
                events: [
                    { name: "Workshop: Programming Fundamentals" },
                    { name: "Workshop: Maths for Computer Science" }
                ]
            }
        ]
    }

    If I was going to do this as a huge join I was looking at getting repeated data, 
    which would have been a huge pain in the ass when working with Y
    */
    const groups = await db.select().from(groupsSchema)
        .where(
            and(
                eq(groupsSchema.id, String(groupId)),
                eq(groupsSchema.isDeleted, false)
            )
        )

    const timetables = await db.select().from(timetableSchema)
        .innerJoin(groupMembersSchema, eq(groupMembersSchema.timetableId, timetableSchema.id))
        .where(
            eq(groupMembersSchema.groupId, String(groupId))
        )
        .orderBy(groupMembersSchema.order)

    /* 
        Go through all the timetables 
        and then add the events on to it for today
    */
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59);

    const newTimetables = await Promise.all(timetables.map(async (tt) => {
        const events = await db.select()
            .from(eventsSchema)
            .where(and(
                eq(eventsSchema.timetableId, tt.timetables.id),
                gt(eventsSchema.start, dateTimeToStringUtc(startOfToday)),
                lt(eventsSchema.start, dateTimeToStringUtc(endOfToday))
            ))

        return {
            timetable: tt.timetables,
            order: tt.timetable_group_members.order,
            location: tt.timetable_group_members.location,
            events: events
        }
    }))

    // Structure the JSON Response nicely - otherwise it becomes painful to use.
    res.json({
        id: groups[0].id,
        internalName: groups[0].internalName,
        name: groups[0].name,
        subtitle: groups[0].subtitle,
        lastModified: groups[0].lastModified,
        isDeleted: groups[0].isDeleted,
        displayInfoPane: groups[0].displayInfoPane,
        infoPaneText: groups[0].infoPaneText,
        displayInfoPaneQR: groups[0].displayInfoPaneQR,
        infoPaneQRUrl: groups[0].infoPaneQRUrl,
        verbAvailable: groups[0].verbAvailable,
        verbUnavailable: groups[0].verbUnavailable,
        object: groups[0].object,
        timetables: newTimetables
    });
};

export default { getAllTimetableGroups, createTimetableGroup, updateTimetableGroup, deleteTimetableGroup, addTimetableToGroup, removeTimetableFromGroup, updateTimetableGroupMember, getTimetableGroupById };