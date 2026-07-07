const Category = require('../models/Category');
const Project = require('../models/Project');
const { AppError } = require('../utils/errorHandler');

class CategoryService {
  //Create a new category
  async createCategory(userId, categoryData) {
    const { name, description, color, icon } = categoryData;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new AppError('Category name already exists', 409);
    }

    const category = new Category({
      name,
      description: description || '',
      color: color || '#6B7280',
      icon: icon || '📁',
      created_by: userId
    });

    await category.save();
    return category;
  }

  //Get all categories
  async getCategories(filters = {}) {
    const query = {};

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active === 'true';
    }

    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .populate('created_by', 'first_name last_name email')
      .sort({ name: 1 });

    return categories;
  }

  //Get category by ID
  async getCategoryById(categoryId) {
    const category = await Category.findById(categoryId)
      .populate('created_by', 'first_name last_name email');

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  //Get category by name
  async getCategoryByName(name) {
    const category = await Category.findOne({ name });
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  //Update category
  async updateCategory(categoryId, userId, updateData) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check authorization
    const user = await User.findById(userId);
    if (category.created_by.toString() !== userId.toString() && 
        user.role !== 'admin' && user.role !== 'manager') {
      throw new AppError('Not authorized to update this category', 403);
    }

    // Check if name already taken
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: updateData.name 
      });
      if (existingCategory) {
        throw new AppError('Category name already exists', 409);
      }

      // Update project categories
      await Project.updateMany(
        { category: category.name },
        { category: updateData.name }
      );
    }

    const allowedUpdates = ['name', 'description', 'color', 'icon', 'is_active'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        category[field] = updateData[field];
      }
    });

    await category.save();
    return category;
  }

  //Delete category
  async deleteCategory(categoryId, userId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has projects
    const projectCount = await Project.countDocuments({
      category: category.name
    });

    if (projectCount > 0) {
      throw new AppError(`Cannot delete category with ${projectCount} associated projects.`, 400);
    }

    await category.deleteOne();
    return { message: 'Category deleted successfully' };
  }

  //Get category statistics
  async getCategoryStats() {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ is_active: true });

    // Categories with project counts
    const categoriesWithProjects = await Category.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: 'name',
          foreignField: 'category',
          as: 'projects'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          color: 1,
          icon: 1,
          is_active: 1,
          project_count: { $size: '$projects' }
        }
      },
      { $sort: { project_count: -1 } }
    ]);

    return {
      total: totalCategories,
      active: activeCategories,
      categories: categoriesWithProjects
    };
  }
}

module.exports = new CategoryService();