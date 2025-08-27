var cron = require('node-cron');

require('dotenv').config();
const apiUrl = process.env.API_URL as string;

import { refreshTimetableData } from "@/uol-timetable";
import { refreshInternetCalendarStream } from "@/internet-cal";
import { sendRefreshForAllTimetables } from "@/mqtt-refresh";
import { sendDisplayPowerMessage } from "@/mqtt-display-power";

// Run every monday morning at 6 and import all timetable events for this week.
cron.schedule('0 6 * * 1', async () => {
    console.log('⏰ Refreshing Timetable Data');
    await refreshTimetableData()
});

// Run every 15 minutes and update ical data
cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Refreshing ICal Data');
    await refreshInternetCalendarStream();
});

// Run every morning at 1 min past midnight and refresh all the screens
cron.schedule('1 0 * * *', async () => {
    console.log('⏰ Refreshing all timetables as the day has changed!');
    await sendRefreshForAllTimetables()
});

// Turn off the Displays at 7pm
cron.schedule('0 19 * * *', async () => {
    console.log('⏰ Sending Display Power Off');
    await sendDisplayPowerMessage("off")
});

// Turn off the Displays at 8am
cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Sending Display Power On');
    await sendDisplayPowerMessage("on")
});

// ---- Debugs! ----

// Handle Manual Control of TVs
if (process.argv.slice(2)[0] == '--power-tv') {
    const state = process.argv.slice(2)[1].toLowerCase()
    console.log(`**Manually turning the TVs ${state}**`);

    (async () => {
        await sendDisplayPowerMessage(state);
    })();
}

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
        await sendRefreshForAllTimetables()
    })();
}



// Debug that the service is running.
console.log("Awaiting for my jobs!")
console.log("Connecting to API at " + apiUrl)
