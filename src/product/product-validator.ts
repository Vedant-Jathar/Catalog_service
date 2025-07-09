import { body } from "express-validator";

export const createProductValidator = [
    body("name")
        .exists()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product name should be a string"),

    body("description")
        .exists()
        .withMessage("Description is required"),

    body("priceConfiguration")
        .exists()
        .withMessage("PriceConfiguration is required"),

    body("attributes")
        .exists()
        .withMessage("Attributes aretenantId required"),

    body("tenantId")
        .exists()
        .withMessage("TenantId is required"),

    body("categoryId")
        .exists()
        .withMessage("CategoryId is required")
]