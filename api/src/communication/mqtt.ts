import { db } from "@/db";
import { timetables as timetableSchema, carousels as carouselSchema } from "@/db/schema";
import { eq, and, ConsoleLogWriter, or } from 'drizzle-orm';

const mqtt = require('mqtt')
const dotenv = require('dotenv');
dotenv.config();

export class MqttCommunicator {
    static #instance: MqttCommunicator;
    client: any;

    public static get instance(): MqttCommunicator {
        if (!MqttCommunicator.#instance) {
            MqttCommunicator.#instance = new MqttCommunicator();
        }

        return MqttCommunicator.#instance;
    }

    constructor() {
        const clientId = 'asgard-api_' + Math.random().toString(8).substr(2, 4)
        const clientUri = `mqtt://${process.env.MQTT_BROKER}:1883`
        this.client = mqtt.connect(clientUri, { clientId: clientId, clean: false });

        this.client.on("error", function (err: any) {
            console.log("🙊 MQTT > " + err)
        })
    }

    SendMqttMessage(topic: string, payload: string) {
        console.log("sending mqtt message to " + topic)
        this.client.publish(topic, payload);
    }

    async SendTimetableRefresh(timetableId: string) {
        try {
            const timetable = await db.select().from(timetableSchema)
                .where(and(
                    or(
                        eq(timetableSchema.id, String(timetableId)),
                        eq(timetableSchema.spaceCode, String(timetableId))
                    ),
                    eq(timetableSchema.isDeleted, false)
                ));

            this.SendMqttMessage(`asgard/timetable/refresh/${timetable[0].id}`, "refresh")
            this.SendMqttMessage(`asgard/timetable/refresh/${timetable[0].spaceCode}`, "refresh")
        } catch {
            console.error("⚠️ couldn't get timetable to figure out its space code or failed to send the message")
        }
    }

    async SendCarouselRefresh(carouselId: string) {
        try {
            const carousel = await db.select().from(carouselSchema).where(eq(carouselSchema.id, carouselId))
            this.SendTimetableRefresh(String(carousel[0].timetable))
        } catch {
            console.error("⚠️ couldn't get carousel to figure out its space code or failed to send the message")
        }
    }
}