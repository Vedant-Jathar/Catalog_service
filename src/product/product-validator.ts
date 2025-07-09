import { body } from "express-validator";

export const productValidator = [
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

    // body("image")
    //     .exists()
    //     .withMessage("Image is required")
    //     .custom((value, { req }) => {
    //         if (!req.files) return false
    //         return true
    //     }),
    
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