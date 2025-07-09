import mongoose from "mongoose"
import { Attribute, Category, PriceConfiguration } from "./category-types"


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
        type: Map,
        of: PriceConfigurationSchema,
        required: true
    },
    attributes: {
        type: [AttributeSchema],
        required: true
    }
}, { timestamps: true })

export default mongoose.model("Category", CategorySchema)