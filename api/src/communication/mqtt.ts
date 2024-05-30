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
        this.client.publish(topic, payload);
    }

    SendTimetableRefresh(timetableId: string) {
        this.SendMqttMessage(`asgard/timetable/refresh/${timetableId}`, "refresh")
    }
}