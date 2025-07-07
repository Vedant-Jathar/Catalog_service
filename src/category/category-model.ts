import mongoose from "mongoose"

interface PriceConfiguration {
    [key: string]: {
        priceType: "base" | "additional",
        availableOptions: string[]
    }
}

interface Attribute {
    name: string
    widgetType: "switch" | "radio"
    defaultValue: string
    availableOptions: string[]
}

export interface Category {
    name: string
    priceConfiguration: PriceConfiguration,
    attributes: Attribute[]
}

const AttributeSchema = new mongoose.Schema<Attribute>({
    name: {
        type: String,
        required: true
    },
    widgetType: {
        type: String,
        required: true,
        enum: ["switch", "radio"],
    },
    availableOptions: {
        type: [String],
        required: true
    },
    defaultValue: {
        type: String,
        required: true
    },
})

const PriceConfigurationSchema = new mongoose.Schema<PriceConfiguration>({
    priceType: {
        type: String,
        required: true,
        enum: ["base", "additional"]
    },
    availableOptions: {
        type: [String],
        required: true
    }
})

const CategorySchema = new mongoose.Schema<Category>({
    name: {
        type: String,
        required: true
    },
    priceConfiguration: {
        type: PriceConfigurationSchema,
        required: true
    },
    attributes: {
        type: [AttributeSchema],
        required: true
    }
})

export default mongoose.model("Category", CategorySchema)