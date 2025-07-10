import { Filters, PaginationFilters, Product } from "./product-types";
import ProductModel from "./product-model"
import productModel from "./product-model";
import { PaginationLabels } from "../config/pagination";

export class ProductService {

    getProductById = async (id: string) => {
        return await productModel.findById(id) as Product
    }

    createProduct = async (product: Product) => {
        return await ProductModel.create(product) as Product
    }

    updateProduct = async (productId: string, product: Product) => {
        return await productModel.findOneAndUpdate({ _id: productId },
            {
                $set: product
            },
            { new: true }
        ) as Product
    }

    getFilteredProducts = async (q: string, filters: Filters, paginationFilters: PaginationFilters) => {

        const searchQueryExp = new RegExp(q, "i")
        const matchQuery = {
            ...filters,
            name: searchQueryExp
        }

        const aggregationPipeline = [
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

        ]

        return productModel.aggregatePaginate(productModel.aggregate(aggregationPipeline), {
            ...paginationFilters,
            customLabels: PaginationLabels
        })
    }

    
}
