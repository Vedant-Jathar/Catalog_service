import app from "./app";
import { createMessageProducerBroker } from "./common/factories/brokerFactory";
import { MessageProducerBroker } from "./common/types";
import logger from "./config/logger";
import config from "config";
import mongoose from "mongoose";

const startServer = async () => {
    let messageProducerBroker: MessageProducerBroker | null = null;
    try {
        // Connecting to the Mongo database:
        await mongoose.connect(config.get("database.url"));
        logger.info("Mongo Database connection successful");

        console.log("Hi");

        messageProducerBroker = createMessageProducerBroker();
        await messageProducerBroker.connect();

        console.log("Bi");

        // Listening on the port:
        const PORT: number = config.get("server.port");
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (messageProducerBroker) {
            await messageProducerBroker.disconnect();
        }
        if (err instanceof Error) {
            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
