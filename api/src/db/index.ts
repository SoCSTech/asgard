import "dotenv/config";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Create the connection
export const poolConnection = mysql.createPool({
    host: process.env.DB_HOSTNAME as string,
    user: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string
});

export const db = drizzle(poolConnection);