import { Product } from "./product-types";
import ProductModel from "./product-model"

export class ProductService {

    createProduct = async (product: Product) => {
        return await ProductModel.create(product)
    }
}