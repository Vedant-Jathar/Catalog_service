import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRoutes from './category/category-routes'
const app = express();

app.use(express.json()) 
app.use(express.urlencoded())
app.use('/category', categoryRoutes)

// app.get('/', (req: Request, res: Response) => {
//     res.json({ message: "Hello" })
// })

app.use(globalErrorHandler);

export default app;

