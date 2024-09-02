import { loginAsBotUser } from "@/auth";
import { IEvent, IEventType } from "@/interfaces/event";
import { ITimetable } from "@/interfaces/timetable";
import axios from "axios";
import moment from "moment";
import { CalendarEvent, parse, transform } from 'parse-ical'


require('dotenv').config();
const apiUrl = process.env.API_URL as string;

export async function refreshInternetCalendarStream(): Promise<void> {
    const token = await loginAsBotUser();

    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');

    const asgardTimetables = await getAsgardTimetablesToUpdate();

    for (const timetable of asgardTimetables) {
        let calEvents = await getICalEventsFromUrl(timetable.dataUrl);

        // Get all the Asgard events for that timetable...
        let asgardEvents = await getAsgardEventsForTimetable(timetable.id);

        for (const aEvent of asgardEvents) {
            let hasChanged = false;
            const eventStartTime = moment(aEvent.start);

            // If the event is not this week, delete it from Asgard.
            if (eventStartTime < startOfWeek || eventStartTime > endOfWeek) {
                await deleteAsgardEvent(aEvent.id, token);
                continue;
            }

            // Check if it is different from what's in Asgard
            let currentCalEvent = calEvents.find(item => item.uid === aEvent.externalId);

            // All day events to be set to 9-5
            if (currentCalEvent?.start.isAllDay) {
                let start = currentCalEvent.start.date;
                start.setHours(9);
                currentCalEvent.start.date = start;

                let end = currentCalEvent.end.date;
                end.setHours(17);
                currentCalEvent.end.date = end;
            }

            // If the event is already in Asgard
            if (currentCalEvent) {
                if (currentCalEvent.title !== aEvent.name) {
                    aEvent.name = currentCalEvent.title;
                    hasChanged = true;
                }

                if (new Date(currentCalEvent.start.date).getTime() !== new Date(aEvent.start).getTime()) {
                    aEvent.start = new Date(currentCalEvent.start.date);
                    hasChanged = true;
                }

                if (new Date(currentCalEvent.end.date).getTime() !== new Date(aEvent.end).getTime()) {
                    aEvent.end = new Date(currentCalEvent.end.date);
                    hasChanged = true;
                }

                // If there have been changes, update it in Asgard
                if (hasChanged) {
                    console.log("Updating ", aEvent.name);
                    await updateAsgardWithEvent(aEvent, token);
                }

                // Remove the calendar event from the queue
                calEvents = calEvents.filter(item => item.uid !== currentCalEvent.uid);
                continue;
            }

            // If the event exists in Asgard but not the iCal, delete it
            await deleteAsgardEvent(aEvent.id, token);
        }

        // Process the left over events
        for (const cEvent of calEvents) {
            const eventStartTime = moment(cEvent.start.date);

            // If the event is not this week, don't bother adding it.
            if (eventStartTime < startOfWeek || eventStartTime > endOfWeek) {
                continue;
            }

            await addEventToAsgard(cEvent, timetable, token);
        }
    }
}


async function getAsgardTimetablesToUpdate(): Promise<ITimetable[]> {
    // Get list of timetables that i need to fetch data for...
    const response = await axios.get(
        `${apiUrl}/v2/timetable/type/ICAL`,
    );
    const data = response.data;
    return data.timetables as ITimetable[]
}

async function getAsgardEventsForTimetable(timetableId: string): Promise<IEvent[]> {
    // Get list of timetables that i need to fetch data for...
    const response = await axios.get(
        `${apiUrl}/v2/timetable/${timetableId}/events`,
    );
    const data = response.data;
    return data.events as IEvent[]
}

async function getICalEventsFromUrl(dataUrl: string): Promise<CalendarEvent[]> {
    // Get calendar events from ical stream and parse them into events
    const cal = await axios.get(dataUrl);
    const { events } = transform(parse(cal.data))
    return events
}

async function updateAsgardWithEvent(event: IEvent, token: string) {
    // action to update event
    // calEvent.uid is externalId
    console.log("Updating ", event.name)

    try {
        const response = await axios.put(
            apiUrl + "/v2/event",
            event,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status == 201) {
            console.log(`Updated event ${event.name} on ${event.start}`)
            return
        } else {
            console.error(`⛔️ ${response.status} -> ${event.name} on ${event.start}`)
            return
        }

    } catch (error: any) {
        console.error(error?.code, error?.data)
    }
}

async function addEventToAsgard(calEvent: CalendarEvent, timetable: ITimetable, token: string) {
    // action to update event
    // calEvent.uid is externalId
    // this is required to match the events
    console.log("Adding ", calEvent.title)
    try {
        const response = await axios.post(
            apiUrl + "/v2/event",
            {
                name: calEvent.title,
                staff: "",
                moduleCode: "",
                timetableId: timetable.id,
                type: "OTHER",
                colour: timetable.defaultColour,
                start: moment(calEvent.start.date).format("YYYY-MM-DD HH:mm:ss"),
                end: moment(calEvent.end.date).format("YYYY-MM-DD HH:mm:ss"),
                isCombinedSession: false,
                group: "",
                externalId: calEvent.uid,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (response.status == 201) {
            console.log(`Created new event ${calEvent.title} on ${calEvent.start.date}`)
            return
        } else {
            console.error(`⛔️ ${response.status} -> ${calEvent.title} on ${calEvent.start.date}`)
            return
        }

    } catch (error: any) {
        console.error(error?.code, error?.data, error?.response?.data)
    }
}

async function deleteAsgardEvent(eventId: string, token: string) {
    console.log("Deleting event " + eventId)

    try {
        const response = await axios.delete(
            apiUrl + "/v2/event/" + eventId,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status == 201) {
            console.log(`Delete OK`)
            return
        } else {
            console.error(`⛔️ ${response.status}`)
            return
        }

    } catch (error: any) {
        console.error(error?.code, error?.data)
    }
}