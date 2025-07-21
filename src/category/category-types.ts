import { Request } from "express"

export interface PriceConfiguration {
    [key: string]: {
        priceType: "base" | "additional",
        availableOptions: string[]
    }
}

export interface Attribute {
    name: string
    widgetType: "switch" | "radio"
    defaultValue: string
    availableOptions: string[]
}

export interface Category {
    _id?: string
    name: string
    priceConfiguration: PriceConfiguration,
    attributes: Attribute[]
    hasToppings?: boolean
}

export interface CreateCatgeoryRequest extends Request {
    body: Category
}
