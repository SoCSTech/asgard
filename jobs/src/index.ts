var cron = require('node-cron');

import { refreshTimetableData } from "@/uol-timetable";

// Runs every hour on the hour!
cron.schedule('0/30 * * * * *', async () => {
    console.log('⏰ Refreshing Timetable Data');
    await refreshTimetableData()
});