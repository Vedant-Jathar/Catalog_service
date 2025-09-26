import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { CreateProductRequest, Filters, Product } from "./product-types";
import { FileStorage } from "../common/types/storage";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { Roles } from "../common/constants";
import {
    AuthRequest,
    getProductsRequest,
    MessageProducerBroker,
} from "../common/types";
import mongoose from "mongoose";
import { mapToObject } from "../utils";

export class ProductController {
    constructor(
        private productService: ProductService,
        private logger: Logger,
        private storage: FileStorage,
        private messageProducerBroker: MessageProducerBroker,
    ) {}

    create = async (req: CreateProductRequest, res: Response) => {
        if (!req.files || !req.files.image) {
            throw createHttpError(400, "Image not found error");
        }

        // Validating the data sent in the body
        const result = validationResult(req);
        if (!result.isEmpty()) {
            throw createHttpError(400, result.array()[0].msg as string);
        }

        // Uploading the image file to the storage(S3 aws)
        const image = req.files.image as UploadedFile;
        const imageName = uuidv4();

        await this.storage.upload({
            filename: imageName,
            filedata: image.data.buffer,
        });

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublished,
        } = req.body;

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(
                priceConfiguration as string,
            ) as Record<string, string>,
            attributes: JSON.parse(attributes as string) as Record<
                string,
                string
            >,
            tenantId: Number(tenantId),
            categoryId,
            isPublished,
            image: imageName,
        };

        const newProduct = await this.productService.createProduct(product);

        this.logger.info("Product created successfully", {
            id: newProduct._id,
        });

        this.messageProducerBroker.sendMessage(
            "product",
            JSON.stringify({
                _id: newProduct._id,
                priceConfiguration: mapToObject(
                    newProduct.priceConfiguration as unknown as Map<
                        string,
                        any
                    >,
                ),
            }),
        );

        res.status(201).json({ id: newProduct._id });
    };

    update = async (
        req: CreateProductRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            throw createHttpError(400, result.array()[0].msg as string);
        }

        const { productId } = req.params;

        const existingProduct =
            await this.productService.getProductByid(productId);

        if (!existingProduct) {
            next(createHttpError(404, "Product not found"));
        }

        // If the user is a manager then check whether he/she is the manager of the restaurant whose product he or she is updating:

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            if (
                Number((req as AuthRequest).auth.tenantId) !==
                Number(existingProduct?.tenantId)
            ) {
                console.log(
                    "(req as AuthRequest).auth.tenantId",
                    typeof (req as AuthRequest).auth.tenantId,
                    "existingProduct?.tenantId",
                    typeof existingProduct?.tenantId,
                );

                next(
                    createHttpError(
                        403,
                        "Forbidden- You are not allowed to access this product",
                    ),
                );
                return;
            }
        }

        let imageName: string | undefined;
        let oldImageName: string | undefined;

        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                filedata: image.data.buffer,
            });

            oldImageName = existingProduct?.image;

            await this.storage.delete(oldImageName!);
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublished,
        } = req.body;

        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(
                priceConfiguration as string,
            ) as Record<string, string>,
            attributes: JSON.parse(attributes as string) as Record<
                string,
                string
            >,
            tenantId,
            categoryId,
            isPublished,
            image: imageName ? imageName : existingProduct?.image,
        };

        const updatedProduct = await this.productService.updateProduct(
            productId,
            product,
        );

        this.messageProducerBroker.sendMessage(
            "product",
            JSON.stringify({
                _id: updatedProduct._id,
                priceConfiguration: mapToObject(
                    updatedProduct.priceConfiguration as unknown as Map<
                        string,
                        any
                    >,
                ),
            }),
        );

        res.json({ _id: productId });
    };

    getProducts = async (req: getProductsRequest, res: Response) => {
        const { q, tenantId, categoryId, isPublished, page, limit } = req.query;

        const paginationFilters = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        };

        const filters: Filters = {};

        if (tenantId) {
            filters.tenantId = Number(tenantId);
        }

        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            filters.categoryId = new mongoose.Types.ObjectId(categoryId);
        }

        if (isPublished === "true") {
            filters.isPublished = true;
        }

        const products = await this.productService.getFilteredProducts(
            q as string,
            filters,
            paginationFilters,
        );

        const finalProductsData = (products.data as Product[]).map(
            (product) => ({
                ...product,
                image: this.storage.getObjectUri(product.image!),
            }),
        );

        const finalResponse = {
            data: finalProductsData,
            currentPage: products.currentPage,
            perPage: products.perPage,
            total: products.total,
        };

        res.json(finalResponse);
    };

    getProductById = async (req: Request, res: Response) => {
        const { productId } = req.params;
        const product = await this.productService.getProductByid(productId);

        // Here i had to user "product._doc" since in the "product" object there was a lot of metadata that was coming along.
        const finalProduct = {
            ...product._doc,
            image: this.storage.getObjectUri(product._doc!.image!),
        };

        res.json(finalProduct);
    };

    deleteProductById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        // First check whether the manager trying to delete a product of a tenant is the manager of that tenant or not
        const { productId } = req.params;
        const product =
            await this.productService.getProductByIdWithImageFileName(
                productId,
            );

        if ((req as AuthRequest).auth.role === "manager") {
            if (
                Number(product.tenantId) !==
                Number((req as AuthRequest).auth.tenantId)
            ) {
                next(createHttpError(403, "Forbidden error"));
                return;
            }
        }

        await this.productService.deleteProductByid(productId);

        await this.storage.delete(product.image!);

        res.json({});
    };
}
