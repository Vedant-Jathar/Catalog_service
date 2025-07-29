import { Kafka, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;

    constructor(clientId: string, brokers: string[]) {
        const kafka = new Kafka({ clientId, brokers });
        this.producer = kafka.producer();
    }

    connect = async () => {
        await this.producer.connect();
    };

    disconnect = async () => {
        if (this.producer) {
            await this.producer.disconnect();
        }
    };

    /**
     * @param topic - where the message has to be sent
     * @param message - what has to be sent
     * @throws {Error} - when the producer is not connected
     */
    sendMessage = async (topic: string, message: string) => {
        await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
    };
}
