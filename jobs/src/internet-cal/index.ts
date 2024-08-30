import { loginAsBotUser } from "@/auth";
import { IEventType } from "@/interfaces/event";
import { ITimetable } from "@/interfaces/timetable";
import axios from "axios";
import moment from "moment";
import { parse, transform } from 'parse-ical'


require('dotenv').config();
const apiUrl = process.env.API_URL as string;

export async function refreshInternetCalendarStream(): Promise<void> {
    const cal = await axios.get('https://calendar.google.com/calendar/ical/redacted/basic.ics');

    const { events } = transform(parse(cal.data))

    events.forEach(calEvent => {
        console.log(`- ${calEvent.title} \nID:${calEvent.uid} \n${moment(calEvent.start.date)} till ${moment(calEvent.end.date)} \nAll day? ${calEvent.start.isAllDay}\n\n`)
    })
}