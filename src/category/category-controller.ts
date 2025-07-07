import { Response } from "express";
import { CreateCatgeoryRequest } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class CategoryController {

    constructor(private categoryService: CategoryService, private logger: Logger) {
        this.create = this.create.bind(this)
    }

    create = async (req: CreateCatgeoryRequest, res: Response) => {


        const result = validationResult(req)

        if (!result.isEmpty()) {
            throw createHttpError(400, result.array()[0].msg as string)
        }

        const { name, priceConfiguration, attributes } = req.body
        const newCategory = await this.categoryService.create({ name, priceConfiguration, attributes })
        this.logger.info("Category created successfully")
        res.json({ id: newCategory._id })

    }
}