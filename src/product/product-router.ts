import { Router } from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAcces } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { asyncWrapper } from "../common/utils/wrapper";
import { ProductController } from "./productController";
import { productValidator } from "./product-validator";
import { ProductService } from "./product-service";
import logger from "../config/logger";
import fileUpload from "express-fileupload";
const router = Router()

const productService = new ProductService()
const productController = new ProductController(productService, logger)

router.post('/',
    authenticate,
    canAcces([Roles.ADMIN, Roles.MANAGER]),
    fileUpload(),
    productValidator,
    asyncWrapper(productController.create)
)

export default router