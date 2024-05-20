import { db } from "@/db"
import { logs as logSchema } from '@/db/schema';


export async function log(message: string, user: string = "Anonymous") {
    console.log(`> ${user}: ${message}`)
    
    let userId = null
    if (user !== "Anonymous")
        userId = user

    await db.insert(logSchema).values({
        user: userId,
        message: message
    })
}