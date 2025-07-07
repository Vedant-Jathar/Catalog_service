import app from "./app";
import logger from "./config/logger";
import config from 'config'
import mongoose from "mongoose";

const startServer = async () => {
    try { 
        // Connecting to the Mongo database:
        await mongoose.connect(config.get("database.url"))
        logger.info("Mongo Database connection successful")
        
        // Listening on the port:
        const PORT: number = config.get("server.port")
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
