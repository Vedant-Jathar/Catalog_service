import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { ProductService } from "./product-service"
import { Logger } from "winston"
import { CreateProductRequest, Filters, Product } from "./product-types"
import { FileStorage } from "../common/types/storage"
import { v4 as uuidv4 } from "uuid"
import { UploadedFile } from "express-fileupload"
import { Roles } from "../common/constants"
import { AuthRequest, getProductsRequest } from "../common/types"
import mongoose from "mongoose"

export class ProductController {
    constructor(private productService: ProductService, private logger: Logger, private storage: FileStorage) {
    }

    create = async (req: CreateProductRequest, res: Response) => {
        if (!req.files || !req.files.image) {
            throw createHttpError(400, "Image not found error")
        }

        // Validating the data sent in the body
        const result = validationResult(req)
        if (!result.isEmpty()) {
            console.log("result.array()", result.array());
            throw createHttpError(400, result.array()[0].msg as string)
        }

        // Uploading the image file to the storage(S3 aws)
        const image = req.files.image as UploadedFile
        const imageName = uuidv4()

        await this.storage.upload({
            filename: imageName,
            filedata: image.data.buffer
        })

        const { name, description, priceConfiguration, attributes, tenantId, categoryId, isPublished } = req.body

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string) as Record<string, string>,
            attributes: JSON.parse(attributes as string) as Record<string, string>,
            tenantId: Number(tenantId),
            categoryId,
            isPublished,
            image: imageName

        }

        const newProduct = await this.productService.createProduct(product)

        this.logger.info("Product created successfully", { id: newProduct._id })

        res.status(201).json({ id: newProduct._id })
    }

    update = async (req: CreateProductRequest, res: Response, next: NextFunction) => {

        const result = validationResult(req)
        if (!result.isEmpty()) {
            throw createHttpError(400, result.array()[0].msg as string)
        }

        const { productId } = req.params

        const existingProduct = await this.productService.getProductByid(productId)

        if (!existingProduct) {
            next(createHttpError(404, "Product not found"))
        }

        // Check if the user trying to update this product is the manager of the tenant the product belongs to:

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            if ((req as AuthRequest).auth.tenantId !== existingProduct?.tenantId) {
                next(createHttpError(403, "Forbidden- You are not allowed to access this product"))
                return
            }
        }

        let imageName: string | undefined
        let oldImageName: string | undefined

        if (req.files?.image) {
            const image = req.files.image as UploadedFile
            imageName = uuidv4()

            await this.storage.upload({
                filename: imageName,
                filedata: image.data.buffer
            })

            oldImageName = existingProduct?.image

            await this.storage.delete(oldImageName!)
        }

        const { name, description, priceConfiguration, attributes, tenantId, categoryId, isPublished } = req.body


        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration as string) as Record<string, string>,
            attributes: JSON.parse(attributes as string) as Record<string, string>,
            tenantId,
            categoryId,
            isPublished,
            image: imageName ? imageName : oldImageName
        }

        await this.productService.updateProduct(productId, product)

        res.json({ _id: productId })

    }

    getProducts = async (req: getProductsRequest, res: Response) => {


        const { q, tenantId, categoryId, isPublished, page, limit } = req.query

        const paginationFilters = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        }

        const filters: Filters = {}

        if (tenantId) {
            filters.tenantId = Number(tenantId)
        }

        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            filters.categoryId = new mongoose.Types.ObjectId(categoryId)
        }

        if (isPublished === "true") {
            filters.isPublished = true
        }

        const products = await this.productService.getFilteredProducts(q as string, filters, paginationFilters)

        const finalProductsData = (products.data as Product[]).map((product) => ({
            ...product,
            image: this.storage.getObjectUri(product.image!)
        }))

        const finalResponse = {
            data: finalProductsData,
            currentPage: products.currentPage,
            perPage: products.perPage,
            total: products.total
        }

        res.json(finalResponse)
    }

    getProductById = async (req: Request, res: Response) => {

        const { productId } = req.params
        const product = await this.productService.getProductByid(productId)

        // Here i had to user "product._doc" since in the "product" object there was a lot of metadata that was coming along.
        const finalProduct = {
            ...product._doc,
            image: this.storage.getObjectUri(product._doc!.image!)
        }

        res.json(finalProduct)
    }

    deleteProductById = async (req: Request, res: Response, next: NextFunction) => {

        // First check whether the manager trying to delete a product of a tenant is the manager of that tenant or not
        const { productId } = req.params
        const product = await this.productService.getProductByIdWithImageFileName(productId)

        console.log("product", product);


        if ((req as AuthRequest).auth.role === "manager") {
            if (product.tenantId !== (req as AuthRequest).auth.tenantId) {
                next(createHttpError(403, "Forbidden error"))
                return
            }
        }

        await this.productService.deleteProductByid(productId)

        await this.storage.delete(product.image!)

        res.json({})
    }
}