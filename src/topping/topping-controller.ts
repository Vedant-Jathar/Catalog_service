import { NextFunction, Request, Response } from "express";
import {
    CreateToppingsRequest,
    getToppingsRequest,
    Topping,
} from "./topping-types";
import createHttpError from "http-errors";
import { ToppingService } from "./topping-service";
import { Logger } from "winston";
import { S3Storage } from "../common/services/S3Storage";
import { v4 as uuidV4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import { AuthRequest, MessageProducerBroker } from "../common/types";
import toppingModel from "./topping-model";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: S3Storage,
        private logger: Logger,
        private messageProducerBroker: MessageProducerBroker,
    ) {}

    create = async (
        req: CreateToppingsRequest,
        res: Response,
        next: NextFunction,
    ) => {
        if (!req.files || !req.files.image) {
            next(createHttpError(404, "Image not found"));
            return;
        }

        const result = validationResult(req);

        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string));
            return;
        }

        const { name, price, isPublished, tenantId } = req.body;

        // The manager of a tenant can create toppings only for that tenant:
        if (
            (req as AuthRequest).auth.role === "manager" &&
            (req as AuthRequest).auth.tenantId !== String(tenantId)
        ) {
            next(createHttpError(403, "Forbidden error"));
            return;
        }

        // Upload image to the Storage:

        const image = req.files.image as UploadedFile;
        const imageName = uuidV4();

        await this.storage.upload({
            filename: imageName,
            filedata: image.data.buffer,
        });

        const createToppingData = {
            name,
            price,
            tenantId,
            isPublished,
            image: this.storage.getObjectUri(imageName),
        };

        const topping: Topping =
            await this.toppingService.createTopping(createToppingData);

        this.messageProducerBroker.sendMessage(
            "topping",
            JSON.stringify({
                _id: topping._id,
                price: topping.price,
                tenantId: topping.tenantId,
            }),
        );

        res.status(201).json({ _id: topping._id });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const result = validationResult(req);

        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string));
            return;
        }

        const { name, price, isPublished, tenantId } = req.body;

        // The manager of a tenant can create toppings only for that tenant:
        if (
            (req as AuthRequest).auth.role === "manager" &&
            (req as AuthRequest).auth.tenantId !== String(tenantId)
        ) {
            next(createHttpError(403, "Forbidden error"));
            return;
        }

        const existingToppping = await toppingModel.findById(id);

        if (!existingToppping) {
            return next(createHttpError(404, "Topping does not exist"));
        }

        let imageName: string | undefined;
        let oldImageName: string | undefined;

        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            imageName = uuidV4();

            await this.storage.upload({
                filename: imageName,
                filedata: image.data.buffer,
            });

            oldImageName = existingToppping.image;

            await this.storage.delete(oldImageName);
        }

        const updateToppingData = {
            name,
            price,
            isPublished,
            image: imageName ? imageName : existingToppping.image,
            tenantId,
        };

        const updatedTopping: Topping = (await toppingModel.findByIdAndUpdate(
            id,
            updateToppingData,
            {
                new: true,
            },
        ))!;

        res.json({ id: updatedTopping._id });
    };

    getAllToppings = async (req: Request, res: Response) => {
        const allToppings = await toppingModel.find();
        res.json(allToppings);
    };

    getToppings = async (req: Request, res: Response) => {
        const { tenantId } = (req as getToppingsRequest).query;

        const filters = {
            tenantId: Number(tenantId),
        };

        const result = await this.toppingService.getToppings(filters);

        console.log("result", result);

        res.json(result);
    };

    delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const existingToppping = await toppingModel.findById({ _id: id });
        if (!existingToppping) {
            throw createHttpError(400, "Topping does not exist");
        }
        await toppingModel.deleteOne({ _id: id });
        res.json({});
    };
}
