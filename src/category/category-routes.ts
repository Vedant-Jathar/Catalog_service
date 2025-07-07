import { Router } from "express"
import { CategoryController } from "./category-controller"
import { CategoryService } from "./category-service"
import logger from "../config/logger"
// import { createCategoryValidator } from "../category/category-validator"
import { asyncWrapper } from "../common/utils/wrapper"
import { createCategoryValidator } from "./category-validator"

const router = Router()
const categoryService = new CategoryService()
const categoryController = new CategoryController(categoryService, logger)

router.post('/',createCategoryValidator, asyncWrapper(categoryController.create))

export default router

