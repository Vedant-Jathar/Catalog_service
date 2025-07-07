import CategoryModel from '../category/category-model'
import { Category } from './category-types'

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category)
        await newCategory.save()
        return newCategory
    }
}