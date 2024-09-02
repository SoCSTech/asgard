var cron = require('node-cron');

import { refreshTimetableData } from "@/uol-timetable";
import { refreshInternetCalendarStream } from "@/internet-cal";

// Run every monday morning at 6 and import all timetable events for this week.
cron.schedule('0 6 * * 1', async () => {
    console.log('⏰ Refreshing Timetable Data');
    await refreshTimetableData()
});

// Run every minute and update ical data
cron.schedule('* * * * *', async () => {
    console.log('⏰ Refreshing ICal Data');
    await refreshInternetCalendarStream();
});






// Handle Manual Refresh
if (process.argv.slice(2)[0] == '--refresh-data') {
    console.log("**Running Manual Refresh Mode**");

    // Run jobs
    (async () => {
        console.log('⏰ Refreshing Timetable Data');
        await refreshTimetableData();
    })();
}

// Handle Testing
if (process.argv.slice(2)[0] == '--test') {
    console.log("**Running Test Mode**");

    // Run jobs
    (async () => {
        console.log('⏰ Refreshing ICal Data');
        await refreshInternetCalendarStream();
    })();
}



// Debug that the service is running.
console.log("Awaiting for my jobs!")