import mongoose from "mongoose";
import { Topping } from "./topping-types";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const toppingsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    tenantId: {
        type: Number,
        required: true
    },

    image: {
        type: String,
        required: true
    },

    isPublished: {
        type: Boolean,
        required: false,
        default: false
    }
}, { timestamps: true })

toppingsSchema.plugin(mongooseAggregatePaginate)
export default mongoose.model<Topping>("Topping", toppingsSchema)
