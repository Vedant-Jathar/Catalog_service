import { Request } from "express";

export interface Product {
    name: string,
    description: string,
    priceConfiguration: string | Record<string, string>,
    attributes: string | Record<string, string>,
    tenantId: string,
    categoryId: string,
    isPublished: string,
    image?: string
}

export interface CreateProductRequest extends Request {
    body: Product
}

export interface PriceConfiguration {

}