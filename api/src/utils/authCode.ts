import { randomBytes } from 'crypto';

export function generateSecureCode(): string {
    const chars = '0123456789ABCDEF';
    const length = 8;

    let code = '';
    const charsLength = chars.length;

    // Determine the number of bytes needed
    const bytesNeeded = Math.ceil((Math.log(charsLength) / Math.log(2)) * length);

    // Generate secure random bytes
    const randomBytesBuffer = randomBytes(bytesNeeded);

    for (let i = 0; i < length; i++) {
        // Map the random byte to an index in the character set
        const randomIndex = randomBytesBuffer[i] % charsLength;
        code += chars[randomIndex];
    }

    return code;
}