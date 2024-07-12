var cron = require('node-cron');

import { refreshTimetableData } from "@/uol-timetable";

// Runs every minute
cron.schedule('* * * * *', async () => {
    console.log('⏰ Refreshing Timetable Data');
    await refreshTimetableData()
});