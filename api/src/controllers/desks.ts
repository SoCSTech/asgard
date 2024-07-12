import { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { desks as deskSchema, timetables as timetableSchema } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { convertSpaceCodeToTimetableId } from "./timetables";

const dotenv = require('dotenv');
dotenv.config();

export const simplifiedDesk = {
    id: deskSchema.id,
    timetableId: timetableSchema.id,
    lab: timetableSchema.lab,
    spaceCode: timetableSchema.spaceCode,
    desk: deskSchema.desk,
    macAddress: deskSchema.macAddress,
    lastSeen: deskSchema.lastSeen,
    lastOs: deskSchema.lastOs
};


const getAllDesks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const desks = await db.select(simplifiedDesk)
            .from(deskSchema)
            .leftJoin(timetableSchema, eq(deskSchema.timetableId, timetableSchema.id))

        res.json({ desks: desks });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" })
    }
}

const getDeskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let id = req.params.id as string

        const desks = await db.select(simplifiedDesk)
            .from(deskSchema)
            .leftJoin(timetableSchema, eq(deskSchema.timetableId, timetableSchema.id))
            .where(eq(deskSchema.id, id))

        res.json({ desks: desks });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" })
    }
}


const getDeskByMacAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let mac = req.params.mac as string
        mac = mac.toLowerCase()
        mac = mac.replace("-", "").replace(":", "")

        const desks = await db.select(simplifiedDesk)
            .from(deskSchema)
            .leftJoin(timetableSchema, eq(deskSchema.timetableId, timetableSchema.id))
            .where(eq(deskSchema.macAddress, mac))

        res.json({ desks: desks });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" })
    }
}

const getDesksByTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let timetable = await convertSpaceCodeToTimetableId(req.params.id as string)

        const desks = await db.select(simplifiedDesk)
            .from(deskSchema)
            .leftJoin(timetableSchema, eq(deskSchema.timetableId, timetableSchema.id))
            .where(eq(deskSchema.timetableId, timetable))

        res.json({ desks: desks });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong!" })
    }
}

export default { getAllDesks, getDeskById, getDeskByMacAddress, getDesksByTimetable };