import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRoutes from "./category/category-routes";
import cookieParser from "cookie-parser";
import productRoutes from "./product/product-router";
import cors from "cors";
import toppingRoutes from "./topping/topping-router";
import config from "config";

const app = express();

const ALLOWED_DOMAINS = [
    config.get("frontend.clientUI"),
    config.get("frontend.adminUI"),
];

app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/toppings", toppingRoutes);

app.use(globalErrorHandler);

export default app;
