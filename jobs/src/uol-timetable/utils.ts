import { ITimetable } from "@/interfaces/timetable";
import axios from "axios";

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