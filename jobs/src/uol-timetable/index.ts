import { loginAsBotUser } from "@/auth";
import { ITimetable } from "@/interfaces/timetable";
import { deleteAllEventsFromTimetable, getCurrentWeekNumber, getTimetablesWhichCanBeUpdated } from "@/uol-timetable/utils";

export async function refreshTimetableData(): Promise<void> {
    const weekNumber = getCurrentWeekNumber();
    const timetables: ITimetable[] = await getTimetablesWhichCanBeUpdated()

    console.log(weekNumber)
    
    // Handle Auth!
    await loginAsBotUser()

    // timetables.map(async (timetable: ITimetable) => {
    //     console.log("Deleting events from: " + timetable.spaceCode)
    //     await deleteAllEventsFromTimetable(timetable.id)
    // })
}