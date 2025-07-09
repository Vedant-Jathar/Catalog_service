import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRoutes from './category/category-routes'
import cookieParser from "cookie-parser";
import productRoutes from "./product/product-router"

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/category', categoryRoutes)
app.use('/products', productRoutes)

app.use(globalErrorHandler);

export default app;

