import { Filters, PaginationFilters, Product } from "./product-types";
// import ProductModel from "./product-model"
import productModel from "./product-model";
import { PaginationLabels } from "../config/pagination";
import createHttpError from "http-errors";
import { PipelineStage } from "mongoose";

export class ProductService {

    getProductByIdWithImageFileName = async (id: string) => {
        return await productModel.findById(id) as Product
    }

    createProduct = async (product: Product) => {
        return await productModel.create(product) as Product
    }

    updateProduct = async (productId: string, product: Product) => {
        return await productModel.findOneAndUpdate({ _id: productId },
            {
                $set: product
            },
            { new: true }
        ) as Product
    }

    getProductByid = async (productId: string) => {
        const product = await (productModel.findById(productId)) as Product
        if (!product) {
            throw createHttpError(404, "Product not found")
        }
        return product
    }

    getFilteredProducts = async (q: string, filters: Filters, paginationFilters: PaginationFilters) => {

        const searchQueryExp = new RegExp(q, "i")
        const matchQuery = {
            ...filters,
            name: searchQueryExp
        }

        const aggregationPipeline: PipelineStage[] = [

            {
                $match: matchQuery
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $sort: {
                    createdAt: -1
                }
            }

        ]

        return productModel.aggregatePaginate(productModel.aggregate(aggregationPipeline), {
            ...paginationFilters,
            customLabels: PaginationLabels
        })
    }

    deleteProductByid = async (productId: string) => {
        await productModel.deleteOne({ _id: productId })
        return
    }
}




