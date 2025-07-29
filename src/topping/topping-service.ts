import { Topping, toppingFilters } from "./topping-types";
import toppingsModel from "../topping/topping-model";
import { PipelineStage } from "mongoose";

export class ToppingService {
    createTopping = async (topping: Topping) => {
        return await toppingsModel.create(topping);
    };

    getToppings = async (filter: toppingFilters) => {
        const aggregationPipeline: PipelineStage[] = [
            {
                $match: filter,
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ];
        return await toppingsModel.aggregate<Topping[]>(aggregationPipeline);
    };
}
