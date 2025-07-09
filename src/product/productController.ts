import { Response } from "express"
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { ProductService } from "./product-service"
import { Logger } from "winston"
import { CreateProductRequest } from "./product-types"

export class ProductController {
    constructor(private productService: ProductService, private logger: Logger) {
    }

    create = async (req: CreateProductRequest, res: Response) => {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            throw createHttpError(400, result.array()[0].msg as string)
        }

        const { name, description, priceConfiguration, attributes, tenantId, categoryId, image, isPublished } = req.body

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string) as Record<string, string>,
            attributes: JSON.parse(attributes as string) as Record<string, string>,
            tenantId,
            categoryId,
            isPublished,
            image
        }

        const newProduct = await this.productService.createProduct(product)

        this.logger.info("Product created successfully", { id: newProduct._id })

        res.status(201).json({ id: newProduct._id })
    }
}