import { Request, Response } from "express";
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
        res.status(201).json({ id: newCategory._id })
    }

    getCategoryById = async (req: Request, res: Response) => {
        const { id } = req.params

        const existingCategory = await this.categoryService.getCategoryById(id)
        if (!existingCategory) {
            throw createHttpError(404, "Category not found")
        }

        res.json(existingCategory)
    }

    getListOfCategories = async (req: Request, res: Response) => {
        const listOfCategories = await this.categoryService.getAllCategories()
        res.json(listOfCategories)
    }

    deleteCategory = async (req: Request, res: Response) => {
        const { id } = req.params
        const existingCategory = await this.categoryService.getCategoryById(id)
        if (!existingCategory) {
            throw createHttpError(404, "Category not found")
        }
        await this.categoryService.deleteCategoryById(id)
        res.json({})
    }

    updateCategory = async (req: Request, res: Response) => {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            throw createHttpError(400, result.array()[0].msg as string)
        }
        const { name, priceConfiguration, attributes } = (req as CreateCatgeoryRequest).body
        const { id } = req.params

        const existingCategory = await this.categoryService.getCategoryById(id)
        if (!existingCategory) {
            throw createHttpError(404, "Category not found")
        }

        await this.categoryService.updateCategoryById(id, { name, priceConfiguration, attributes })

        res.json({})
    }
}