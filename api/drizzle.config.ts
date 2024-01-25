import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations/",
    breakpoints: true,
    driver: 'mysql2',
    dbCredentials: {
        user: process.env.DB_USERNAME as string,
        password: process.env.DB_PASSWORD as string,
        host: process.env.DB_HOSTNAME as string,
        port: 3306,
        database: process.env.DB_DATABASE as string,
    }
} satisfies Config;