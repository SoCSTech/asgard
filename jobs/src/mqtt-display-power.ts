import mqtt, { MqttClient } from 'mqtt';
require('dotenv').config();

export async function sendDisplayPowerMessage(state: string): Promise<void> {
    const topic = `yggdrasil/display/${state}`.toLowerCase();
    const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:1883`, {
        clientId: `asgard-jobs_${Math.random().toString(8).slice(2, 6)}`,
        clean: false,
    });

    client.on("connect", () => {
        client.publish(topic, "", { qos: 1 }, (err) => {
            if (err) console.error(`Failed to send message to ${topic}:`, err);
            else console.log(`Message sent to ${topic}`);
            client.end();
        });
    });

    client.on("error", (err) => {
        console.error("MQTT Connection Error:", err);
        client.end();
    });
}
