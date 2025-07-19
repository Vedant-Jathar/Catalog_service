import { Request } from "express"

export interface Topping {
    _id?: string
    name: string,
    price: number,
    image: string,
    tenantId: string
    isPublished: boolean
}

export interface CreateToppingsRequest extends Request {
    body: {
        name: string,
        price: number,
        tenantId: string
        isPublished: boolean
    }
}

export interface getToppingFilters {
    tenantId?: string
}

export interface getToppingsRequest extends Request {
    query: {
        tenantId: string
    }
}

export interface toppingFilters {
    tenantId: number

}