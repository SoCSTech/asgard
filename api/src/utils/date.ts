export function dateTimeToString(date: Date): string {
    const newDate: string =
        date.getFullYear() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        +date.getDate() +
        " " +
        +date.getHours() +
        ":" +
        +date.getMinutes();
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