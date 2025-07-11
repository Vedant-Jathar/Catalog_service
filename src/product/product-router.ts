import {  Router } from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAcces } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { asyncWrapper } from "../common/utils/wrapper";
import { ProductController } from "./productController";
import { createProductValidator } from "./product-validator";
import { ProductService } from "./product-service";
import logger from "../config/logger";
import fileUpload from "express-fileupload";
import { S3Storage } from "../common/services/S3Storage";
import createHttpError from "http-errors";
const router = Router()

const productService = new ProductService()
const S3StorageService = new S3Storage()
const productController = new ProductController(productService, logger, S3StorageService)

router.post('/',
    authenticate,
    canAcces([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500000 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            next(createHttpError(400, "Image size exceeds limit"))
        }
    }),
    createProductValidator,
    asyncWrapper(productController.create)
)

router.put("/:productId",
    authenticate,
    canAcces([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 500000 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            next(createHttpError(400, "Image size exceeds limit"))
        }
    }),
    createProductValidator,
    asyncWrapper(productController.update)
)

router.get("/",
    asyncWrapper(productController.getProducts)
)

router.get('/:productId',
    asyncWrapper(productController.getProductById)
)

router.delete("/:productId",
    authenticate,
    canAcces([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(productController.deleteProductById)
)

export default router