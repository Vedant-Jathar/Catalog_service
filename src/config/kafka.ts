import { Kafka, KafkaConfig, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types";
import config from "config";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;

    constructor(clientId: string, brokers: string[]) {
        let kafkaConfig: KafkaConfig = {
            clientId,
            brokers,
        };

        if (process.env.NODE_ENV === "development") {
            kafkaConfig = {
                ...kafkaConfig,
                ssl: true,
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: config.get("kafka.sasl.username"),
                    password: config.get("kafka.sasl.password"),
                },
            };
        }

        if (process.env.NODE_ENV === "production") {
            kafkaConfig = {
                ...kafkaConfig,
                ssl: true,
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: config.get("kafka.sasl.username"),
                    password: config.get("kafka.sasl.password"),
                },
            };
        }

        const kafka = new Kafka(kafkaConfig);
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
