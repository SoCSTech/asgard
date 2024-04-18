import { Request, Response, NextFunction } from 'express';

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware function to check if the user is authenticated
export function authenticate(req: Request, res: Response, next: NextFunction) {
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    // If there is no token provided.
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token provided' });
    }

    // Verify if the JWT is correct
    jwt.verify(token, process.env.AUTH_SECRET as string, (err: any, user: any) => {
        console.log(err)
        if (err) return res.status(401).json({ message: 'Unauthorized: Expired or Invalid Token' });

        // If user is authenticated, proceed to the next middleware or route handler
        next()
    })
}