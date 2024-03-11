import e, { Request, Response, NextFunction } from "express";
import { getUserIdFromJWT } from "@/utils/auth";
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const testUserAuth = async (req: Request, res: Response, next: NextFunction) => {
    // Get the token from request headers, query params, cookies, etc.
    let token = req.headers.authorization as string; // Assuming token is sent in the 'Authorization' header

    try {
        token = token.split(" ")[1] // Split out and just get the token "Bearer eyJhbGciOiJIUz"
    }
    catch (error) {
        console.error(error);
    }

    const userId = getUserIdFromJWT(token);

    res.json({ user: userId });
};

export default { testUserAuth };