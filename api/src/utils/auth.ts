import { Request, Response } from "express";
import { randomBytes } from 'crypto';
import * as OTPAuth from "otpauth";

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

export function getUserIdFromJWT(jwt: string): string {
    // Split JWT with the .s
    // Get the data from the token thats in a base64
    // Return just the id
    const brokenUpJwt = jwt.split(".")
    const tokenData = JSON.parse(atob(brokenUpJwt[1]))
    return tokenData['id']
}

export function getTokenFromAuthCookie(req: Request, res: Response) {
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ "message": "Invalid auth token" })
    }

    return token
}

export function verifyTOTP (secret: string, token: string): boolean {
    console.log(secret)
    const _secret = OTPAuth.Secret.fromBase32(secret)
    console.log(_secret)
    const totp = new OTPAuth.TOTP({secret: _secret, digits: 6, period: 30, algorithm: 'SHA1'})
    const realCode = totp.generate()
    console.log(realCode, "real code")
    console.log(token, "token")

    const validationResponse = totp.validate({ token: token})
    console.log(validationResponse, "validation response")
    const validstep = validationResponse === null ? false : (typeof validationResponse === 'number' && validationResponse < 3 ? true : false);
    console.log(validstep, "valid step")

    return validstep
}