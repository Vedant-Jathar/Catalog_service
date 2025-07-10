import { Filters, Product } from "./product-types";
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

    getFilteredProducts = async (q: string, filters: Filters) => {

        const searchQueryExp = new RegExp(q, "i")
        const matchQuery = {
            ...filters,
            name: searchQueryExp
        }

        console.log("matchQuery", matchQuery);

        const filteredProducts: Product[] = await productModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                _id: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$category"
            }

        ])

        return filteredProducts
    }
}