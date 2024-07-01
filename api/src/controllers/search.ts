import { Request, Response, NextFunction } from "express";
import { db } from '@/db';
import { logs as logSchema, users as userSchema } from '@/db/schema';
import { desc, eq, gte } from 'drizzle-orm';

const dotenv = require('dotenv');
dotenv.config();

const searchQuery = async (req: Request, res: Response, next: NextFunction) => {
    const query = req.params.query

    res.json({ query: query });
}

export default { searchQuery };