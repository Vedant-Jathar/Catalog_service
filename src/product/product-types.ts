import { Request } from "express";
import mongoose from "mongoose";

export interface Product {
    _id?: mongoose.Types.ObjectId,
    name: string,
    description: string,
    priceConfiguration: string | Record<string, string>,
    attributes: string | Record<string, string>,
    tenantId: string,
    categoryId: string,
    isPublished: string,
    image?: string
    _doc?: Record<string, string>
}

export interface CreateProductRequest extends Request {
    body: Product
}

export interface Filters {
    q?: string
    tenantId?: string
    categoryId?: mongoose.Types.ObjectId
    isPublished?: boolean
}

export interface PaginationFilters {
    page: number,
    limit: number
}