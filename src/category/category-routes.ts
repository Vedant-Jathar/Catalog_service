import { Router } from "express";
import { CategoryController } from "./category-controller";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
// import { createCategoryValidator } from "../category/category-validator"
import { asyncWrapper } from "../common/utils/wrapper";
import { createCategoryValidator } from "./category-validator";
import authenticate from "../common/middlewares/authenticate";
import { canAcces } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";

const router = Router();
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post(
    "/",
    authenticate,
    canAcces([Roles.ADMIN]),
    createCategoryValidator,
    asyncWrapper(categoryController.create),
);

router.get("/", asyncWrapper(categoryController.getListOfCategories));

router.get("/:id", asyncWrapper(categoryController.getCategoryById));

router.delete(
    "/:id",
    authenticate,
    canAcces([Roles.ADMIN]),
    asyncWrapper(categoryController.deleteCategory),
);

router.patch(
    "/:id",
    authenticate,
    canAcces([Roles.ADMIN]),
    createCategoryValidator,
    asyncWrapper(categoryController.updateCategory),
);

export default router;
