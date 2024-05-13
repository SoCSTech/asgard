export function dateTimeToString(date: Date): string {
    const timeOptions = { timeZone: "Europe/London" };

    const newDate: string =
        date.getFullYear() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        +date.getDate() +
        " " +
        date.toLocaleTimeString("en-GB", timeOptions)

    return newDate;
}

export function dateToString(date:Date): string {
    const newDate: string =
        date.getFullYear() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        +date.getDate()
    return newDate;
}