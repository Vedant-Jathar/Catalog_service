import mongoose from "mongoose";
import { Topping } from "./topping-types";

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
        type: String,
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

export default mongoose.model<Topping>("Toppping", toppingsSchema)