import { db } from "@/db"
import { logs as logSchema } from '@/db/schema';


export async function log(message: string, user: string = "Anonymous") {
    console.log(`> ${user}: ${message}`)
    await db.insert(logSchema).values({
        user: user,
        message: message
    })
}