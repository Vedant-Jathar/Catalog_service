import { body } from "express-validator";
import createHttpError from "http-errors";

export const createCategoryValidator = [
    body("name")
        .exists()
        .withMessage("Category Name is required")
        .isString()
        .withMessage("Category Name should be a required"),

    body("priceConfiguration")
        .exists()
        .withMessage("Price configuration is required"),

    body("priceConfiguration.*.priceType")
        .exists()
        .withMessage("Price Type is required")
        .custom((value: "base" | "addistional") => {
            const validTypes = ["base", "additional"];
            if (!validTypes.includes(value)) {
                throw createHttpError(
                    400,
                    `${value} is not allowed for the price type`,
                );
            }
            return true;
        }),

    body("attributes").exists().withMessage("Attributes are required"),
];
