export function defaultBoolean(userValue: any, defaultValue: any) {
    if (userValue === undefined) {
        return defaultValue
    } else {
        return userValue
    }
}