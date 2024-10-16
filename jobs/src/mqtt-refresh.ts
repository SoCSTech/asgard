import axios from "axios";
import { ITimetable } from "./interfaces/timetable";
import mqtt, { MqttClient } from 'mqtt';
require('dotenv').config();

const apiUrl = process.env.API_URL as string;

async function getTimetablesFromAsgard(): Promise<ITimetable[]> {
    const response = await axios.get(`${apiUrl}/v2/timetable/`);
    const data = response.data;
    return data.timetables as ITimetable[];
}

async function sendRefreshMqttMessage(client: MqttClient, timetableId: string): Promise<void> {
    const topic = `asgard/timetable/refresh/${timetableId}`;

    client.publish(topic, "refresh", { qos: 1 }, (error) => {
        if (error) {
            console.error(`Failed to send message to ${topic}:`, error);
        } else {
            console.log(`Message sent to ${topic}`);
        }
    });
}

export async function sendRefreshForAllTimetables(): Promise<void> {
    const clientId = 'asgard-jobs_' + Math.random().toString(8).substr(2, 4);
    const clientUri = `mqtt://${process.env.MQTT_BROKER}:1883`;

    const client: MqttClient = mqtt.connect(clientUri, { clientId: clientId, clean: false });

    client.on('connect', async () => {
        console.log('Connected to MQTT broker.');

        try {
            const timetables = await getTimetablesFromAsgard();

            for (const timetable of timetables) {
                await sendRefreshMqttMessage(client, timetable.id);
                await sendRefreshMqttMessage(client, timetable.spaceCode);
            }

            client.end(() => {
                console.log('Disconnected from MQTT broker.');
            });
        } catch (error) {
            console.error('Error fetching timetables or sending MQTT messages:', error);
            client.end();
        }
    });

    client.on('error', (err) => {
        console.error('MQTT Connection Error:', err);
        client.end();
    });
}
