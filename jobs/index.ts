
var cron = require('node-cron');

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
});

cron.schedule('*/5 * * * *', () => {
    console.log('running a task every five minutes');
});

cron.schedule('*/15 * * * * *', () => {
    console.log('Running a task every 15 seconds');
});