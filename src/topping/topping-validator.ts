import { body } from "express-validator";

export const createToppingValidator = [
    body("name")
        .exists()
        .withMessage("Name should be there")
        .isString()
        .withMessage("Name should be a string"),

    body("price")
        .exists()
        .withMessage("Price should be there")
        .isNumeric()
        .withMessage("Price should be numeric"),

    body("tenantId").exists().withMessage("TenantId should be there"),
];
