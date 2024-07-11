import { loginAsBotUser } from "@/auth";
import { ITimetable } from "@/interfaces/timetable";
import { getLastMonday, getTimetablesWhichCanBeUpdated } from "@/uol-timetable/utils";
import axios from "axios";

require('dotenv').config();
const apiUrl = process.env.API_URL as string;

export async function refreshTimetableData(): Promise<void> {
    // const weekNumber = getCurrentWeekNumber();
    const weekNumber = 12; // this is a placeholder to hardcode it to give me a week with data because its the summer holidays!
    const lastMonday = getLastMonday()

    // Fetch all the timetables which are the type of 'uol_timetable'
    const timetables: ITimetable[] = await getTimetablesWhichCanBeUpdated()

    // Handle Auth!
    const token = await loginAsBotUser()

    // Run for each timetable
    timetables.map(async (timetable: ITimetable) => {

        // Delete all the events from effected timetables
        console.log("Deleting events from: " + timetable.spaceCode)
        await deleteAllEventsFromTimetable(timetable.id, token)

        // Read the raw data from the timetable

        // Parse this weeks events

        // Clean up the data and sort out things such as the colours, name and type

        // Add the event to the timetable
    })
}

async function deleteAllEventsFromTimetable(timetableId: string, token: string): Promise<void> {
    const response = await axios.delete(
        `${apiUrl}/v2/timetable/${timetableId}/events`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    );
}