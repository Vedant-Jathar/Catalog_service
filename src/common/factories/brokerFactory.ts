import config from "config";
import { KafkaProducerBroker } from "../../config/kafka";
import { MessageProducerBroker } from "../types";

let brokerProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
    if (!brokerProducer) {
        brokerProducer = new KafkaProducerBroker(
            "catalog-service",
            config.get("kafka.broker"),
        );
    }

    return brokerProducer;
};
