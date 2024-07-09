require('dotenv').config();

export function getCurrentWeekNumber(): number {
    // Get the AY start date from envs, error if you dont get it.
    const academicYearStartDate = process.env.ACADEMIC_YEAR_START_DATE as string;
    if (!academicYearStartDate) {
        throw new Error("ACADEMIC_YEAR_START_DATE is not defined in the environment variables");
    }

    // Set the time up
    const yearStart = new Date(academicYearStartDate); 
    const currentDate = new Date();

    // Check the admin has entered the time right
    if (isNaN(yearStart.getTime())) {
        throw new Error("Invalid date format for ACADEMIC_YEAR_START_DATE");
    }

    // Calculate the difference in milliseconds
    const diffInMs = currentDate.getTime() - yearStart.getTime();

    // Convert milliseconds to weeks
    const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);

    return Math.floor(diffInWeeks);
}