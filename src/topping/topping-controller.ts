import { NextFunction, Request, Response } from "express"
import { CreateToppingsRequest, getToppingsRequest } from "./topping-types"
import createHttpError from "http-errors"
import { ToppingService } from "./topping-service"
import { Logger } from "winston"
import { S3Storage } from "../common/services/S3Storage"
import { v4 as uuidV4 } from "uuid"
import { UploadedFile } from "express-fileupload"
import { validationResult } from "express-validator"
import { AuthRequest } from "../common/types"
import { log } from "node:console"

export class ToppingController {

    constructor(private toppingService: ToppingService, private storage: S3Storage, private logger: Logger) {
    }

    create = async (req: CreateToppingsRequest, res: Response, next: NextFunction) => {

        if (!req.files || !req.files.image) {
            next(createHttpError(404, "Image not found"))
            return
        }

        const result = validationResult(req)

        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string))
            return
        }

        const { name, price, isPublished, tenantId } = req.body

        // The manager of a tenant can create toppings only for that tenant:
        if ((req as AuthRequest).auth.role === "manager" && ((req as AuthRequest).auth.tenantId !== String(tenantId))) {
            next(createHttpError(403, "Forbidden error"))
            return
        }

        // Upload image to the Storage:

        const image = req.files.image as UploadedFile
        const imageName = uuidV4()

        await this.storage.upload({
            filename: imageName,
            filedata: image.data.buffer
        })

        const createToppingData = {
            name,
            price,
            tenantId,
            isPublished,
            image: this.storage.getObjectUri(imageName)
        }

        const topping = await this.toppingService.createTopping(createToppingData)

        res.status(201).json({ _id: topping._id })
    }

    getToppings = async (req: Request, res: Response) => {
        const { tenantId } = (req as getToppingsRequest).query

        const filters = {
            tenantId: Number(tenantId)
        }

        const result = await this.toppingService.getToppings(filters)

        console.log("result", result);

        res.json(result)
    }
}