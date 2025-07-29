import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRoutes from "./category/category-routes";
import cookieParser from "cookie-parser";
import productRoutes from "./product/product-router";
import cors from "cors";
import toppingRoutes from "./topping/topping-router";

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
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
