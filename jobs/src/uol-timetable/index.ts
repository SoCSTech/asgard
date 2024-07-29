import { loginAsBotUser } from "@/auth";
import { IEventType } from "@/interfaces/event";
import { ITimetable } from "@/interfaces/timetable";
import { getCurrentWeekNumber, getEventColour, getEventType, getLastMonday, getTimetablesWhichCanBeUpdated, loadTimetableJsonFile } from "@/uol-timetable/utils";
import axios from "axios";
import moment from "moment";

require('dotenv').config();
const apiUrl = process.env.API_URL as string;

export async function refreshTimetableData(): Promise<void> {
    const weekNumber = getCurrentWeekNumber();
    // const weekNumber = 4; // this is a placeholder to hardcode it to give me a week with data because its the summer holidays!
    const lastMonday = getLastMonday()

    // Fetch all the timetables which are the type of 'uol_timetable'
    const timetables: ITimetable[] = await getTimetablesWhichCanBeUpdated()

    // Handle Auth!
    const token = await loginAsBotUser()

    // Run for each timetable
    timetables.map(async (timetable: ITimetable) => {

        // Delete all the events from effected timetables
        console.log("🗑️ Deleting events from: " + timetable.spaceCode)
        await deleteAllEventsFromTimetable(timetable.id, token)

        // Read the raw data from the timetable
        const rawData = await loadTimetableJsonFile(timetable.spaceCode)

        // Go through **all** the events
        rawData.map(async (rawEvent: any) => {

            // Check if the event is running this week, if it is...
            // Then clean up the data and sort out things such as the colours, name and type
            if (rawEvent.weeksMap.charAt(weekNumber) !== '1') { return }

            // Get the type and the colour
            const eventType: IEventType = getEventType(rawEvent.allEventTypes)
            const eventColour: string = getEventColour(rawEvent.allModuleIds, timetable.defaultColour)

            // Add the event type to the title.
            let eventName: string = rawEvent.allModuleTitles
            if (eventType.type !== "OTHER")
                eventName = `${eventType.name}: ${rawEvent.allModuleTitles}`

            // Figure out start and end times
            let currentWeekDate = moment(getLastMonday()).startOf('week');
            let startDateTime = currentWeekDate.add(rawEvent.weekDay, 'days');
            startDateTime = startDateTime.add(moment.duration(rawEvent.startTime));
            let endDateTime = startDateTime.clone().add(rawEvent.duration, 'minutes');

            // Figure out if it should be combined or not
            let isCombinedSession = false;
            if (rawEvent.allRoomIds.length > timetable.spaceCode) { isCombinedSession = true; }

            // Add to asgard
            try {
                const response = await axios.post(
                    apiUrl + "/v2/event",
                    {
                        name: eventName,
                        staff: (/^\d+$/.test(rawEvent.allLecturerNames) ? "" : rawEvent.allLecturerNames), // if the name is numbers - don't record it!
                        moduleCode: (rawEvent.allModuleIds.length > 20 ? "" : rawEvent.allModuleIds), // if the module code is too long - don't record it!
                        timetableId: timetable.id,
                        type: eventType.type,
                        colour: eventColour,
                        start: startDateTime.format("YYYY-MM-DD HH:mm:ss"),
                        end: endDateTime.format("YYYY-MM-DD HH:mm:ss"),
                        isCombinedSession: isCombinedSession,
                        group: rawEvent.allGroupCodes,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status == 201) {
                    console.log(`Created new event ${eventName} for ${startDateTime.format("YYYY-MM-DD HH:mm:ss")}`)
                    return
                } else {
                    console.error(`⛔️ ${response.status} -> ${eventName} on ${startDateTime.format("YYYY-MM-DD HH:mm:ss")}`)
                }

            } catch (error: any) {
                console.error(error?.code, error?.data)
            }
        })

        console.log(`✅ All events added for ${timetable.spaceCode}!`)
    })
}

async function deleteAllEventsFromTimetable(timetableId: string, token: string): Promise<void> {
    const response = await axios.delete(
        `${apiUrl}/v2/timetable/${timetableId}/events`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}