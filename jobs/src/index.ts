import { getCurrentWeekNumber, getTimetablesWhichCanBeUpdated } from "@/uol-timetable/utils";
import { refreshTimetableData } from "@/uol-timetable";

var cron = require('node-cron');

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
});

cron.schedule('*/5 * * * *', () => {
    console.log('running a task every five minutes');
});

cron.schedule('*/15 * * * * *', async () => {
    console.log('running a task every 15 seconds');
    await refreshTimetableData()
});