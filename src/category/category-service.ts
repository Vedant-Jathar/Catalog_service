import CategoryModel from "../category/category-model";
import { Category } from "./category-types";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        await newCategory.save();
        return newCategory;
    }

    async getCategoryById(id: string) {
        const category = await CategoryModel.findById(id);
        return category;
    }

    async getAllCategories() {
        const allCategories = await CategoryModel.find();
        return allCategories;
    }

    async deleteCategoryById(id: string) {
        await CategoryModel.findByIdAndDelete(id);
    }

    async updateCategoryById(id: string, category: Category) {
        await CategoryModel.findByIdAndUpdate(id, category, {
            new: true,
            runValidators: true,
        });
        return;
    }
}
