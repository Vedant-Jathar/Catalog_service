import { Router } from "express";
import authenticate from "../common/middlewares/authenticate";
import { Roles } from "../common/constants";
import { canAcces } from "../common/middlewares/canAccess";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { createToppingValidator } from "./topping-validator";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import { Logger } from "winston";
import { S3Storage } from "../common/services/S3Storage";
import { asyncWrapper } from "../common/utils/wrapper";
import { createMessageProducerBroker } from "../common/factories/brokerFactory";

const router = Router();

const logger = new Logger();
const storage = new S3Storage();
const toppingService = new ToppingService();
const messageProducerBroker = createMessageProducerBroker();
const toppingController = new ToppingController(
    toppingService,
    storage,
    logger,
    messageProducerBroker,
);

router.post(
    "/",
    authenticate,
    canAcces([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500000 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            next(createHttpError(400, "Image size exceeds limit"));
        },
    }),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

router.get("/", asyncWrapper(toppingController.getToppings));
router.get("/all", asyncWrapper(toppingController.getAllToppings));

export default router;
