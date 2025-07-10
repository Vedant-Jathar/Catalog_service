import { Product } from "./product-types";
import ProductModel from "./product-model"
import productModel from "./product-model";

export class ProductService {

    getProductById = async (id: string) => {
        return await productModel.findById(id)
    }

    createProduct = async (product: Product) => {
        return await ProductModel.create(product)
    }

    updateProduct = async (productId: string, product: Product) => {
        return await productModel.findOneAndUpdate({ _id: productId },
            {
                $set: product
            },
            { new: true }
        )
    }
}