import * as fs from 'fs';
import * as path from 'path';
import axios from "axios";
import { ITimetable } from "@/interfaces/timetable";
import { IEventType } from '@/interfaces/event';

require('dotenv').config();
const apiUrl = process.env.API_URL as string;

export function getCurrentWeekNumber(): number {
    // Get the AY start date from envs, error if you dont get it.
    const academicYearStartDate = process.env.ACADEMIC_YEAR_START_DATE as string;
    if (!academicYearStartDate) {
        throw new Error("ACADEMIC_YEAR_START_DATE is not defined in the environment variables");
    }

    // Set the time up
    const yearStart = new Date(academicYearStartDate);
    const currentDate = new Date();

    // Check the admin has entered the time right
    if (isNaN(yearStart.getTime())) {
        throw new Error("Invalid date format for ACADEMIC_YEAR_START_DATE");
    }

    // Calculate the difference in milliseconds
    const diffInMs = currentDate.getTime() - yearStart.getTime();

    // Convert milliseconds to weeks
    const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);

    return Math.floor(diffInWeeks);
}

export function getLastMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // Sunday - Saturday : 0 - 6

    // If today is Sunday (0), set it to 7 to calculate the last Monday
    const adjustedDayOfWeek = (dayOfWeek === 0) ? 7 : dayOfWeek;

    // Calculate the number of days to subtract to get the last Monday
    const daysToSubtract = adjustedDayOfWeek - 1;

    // Create a new date object for last Monday
    const lastMonday = new Date(today);
    lastMonday.setUTCDate(today.getUTCDate() - daysToSubtract);
    lastMonday.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00 UTC

    return lastMonday;
}

export async function getTimetablesWhichCanBeUpdated(): Promise<ITimetable[]> {
    const response = await axios.get(
        `${apiUrl}/v2/timetable/type/UOL_TIMETABLE`,
    );
    const data = response.data;
    return data.timetables as ITimetable[]
}

export async function loadTimetableJsonFile(spaceCode: string): Promise<any> {
    const filePath = path.resolve(__dirname, `../../data/uol/${spaceCode}.json`);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(`Error loading timetable for ${spaceCode}: ${err}`);
            } else {
                const jsonData = JSON.parse(data)
                if (!jsonData?.success)
                    reject(`Error loading timetable for ${spaceCode}: Data is unsuccessful`);

                if (!jsonData?.returned?.timetableEntries)
                    reject(`Error loading timetable for ${spaceCode}: There's no timetable entries`);

                resolve(jsonData.returned.timetableEntries);
            }
        });
    });
};

export function getEventColour(moduleCode: string): string {
    return "#FF5D73"
}

export function getEventType(rawEventType: string): IEventType {
    if (rawEventType == null || rawEventType == undefined)
        rawEventType = ""

    rawEventType = (rawEventType as string).split('').filter((character: string) => !/\d/.test(character)).join('');

    let returnableEventType: IEventType = { type: "OTHER", name: "" };

    if (rawEventType == "WORKS") {
        returnableEventType.type = "WORKSHOP"
        returnableEventType.name = "Workshop"
    }

    else if (rawEventType == "LECTURE") {
        returnableEventType.type = "LECTURE"
        returnableEventType.name = "Lecture"
    }

    else if (rawEventType == "LEC/SEM") {
        returnableEventType.type = "LECTURE"
        returnableEventType.name = "Lecture/Seminar"
    }

    else if (rawEventType == "LEC/WORKS") {
        returnableEventType.type = "WORKSHOP"
        returnableEventType.name = "Lecture/Workshop"
    }

    else if (rawEventType == "SEM") {
        returnableEventType.type = "LECTURE"
        returnableEventType.name = "Seminar"
    }

    else if (rawEventType == "IT") {
        returnableEventType.type = "WORKSHOP"
        returnableEventType.name = "IT"
    }

    else if (rawEventType == "SEMINAR") {
        returnableEventType.type = "LECTURE"
        returnableEventType.name = "Seminar"
    }

    else if (rawEventType == "PRACTICAL") {
        returnableEventType.type = "PROJECT"
        returnableEventType.name = "Practical"
    }

    else if (rawEventType == "PROJ") {
        returnableEventType.type = "PROJECT"
        returnableEventType.name = "Project"
    }

    else if (rawEventType == "PROJECT") {
        returnableEventType.type = "PROJECT"
        returnableEventType.name = "Project"
    }

    else if (rawEventType == "CLASS") {
        returnableEventType.type = "WORKSHOP"
        returnableEventType.name = "Class"
    }

    else if (rawEventType == "REVIS") {
        returnableEventType.type = "WORKSHOP"
        returnableEventType.name = "Revision"
    }

    else if (rawEventType == "EXAM") {
        returnableEventType.type = "EXAM"
        returnableEventType.name = "Exam"
    }

    else if (rawEventType == "VIVA") {
        returnableEventType.type = "EXAM"
        returnableEventType.name = "Viva"
    }

    else if (rawEventType == "ICT") {
        returnableEventType.type = "EXAM"
        returnableEventType.name = "ICT"
    }

    else if (rawEventType == "TEST") {
        returnableEventType.type = "EXAM"
        returnableEventType.name = "Test"
    }

    else if (rawEventType == "TCA") {
        returnableEventType.type = "EXAM"
        returnableEventType.name = "TCA"
    }

    return returnableEventType
}