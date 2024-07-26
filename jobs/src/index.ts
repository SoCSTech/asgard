var cron = require('node-cron');

import { refreshTimetableData } from "@/uol-timetable";

// Run every monday morning at 6 and import all timetable events for this week.
cron.schedule('0 6 * * 1', async () => {
    console.log('⏰ Refreshing Timetable Data');
    await refreshTimetableData()
});
