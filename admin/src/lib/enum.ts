export function formatEnumValue(value: string): string {
    // Convert the string to lowercase, split by underscores, capitalize each word, and join them back
    return value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace('Uol', 'UoL')
        .replace('Ms', 'Microsoft')
        .replace('Ms', 'Microsoft')
        .replace('Ical', 'Internet Calendar')
}
