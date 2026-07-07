const CategoryService = require('../services/categoryService');
const { AppError } = require('../utils/errorHandler');

class CategoryController {
  //Create a new category
  async createCategory(req, res, next) {
    try {
      const userId = req.user._id;
      const categoryData = req.body;

      const category = await CategoryService.createCategory(userId, categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get all categories
  async getCategories(req, res, next) {
    try {
      const filters = req.query;

      const categories = await CategoryService.getCategories(filters);

      res.status(200).json({
        success: true,
        count: categories.length,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get category by ID
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;

      const category = await CategoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  //Update category
  async updateCategory(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      const category = await CategoryService.updateCategory(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  //Delete category
  async deleteCategory(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const result = await CategoryService.deleteCategory(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  //Get category statistics
  async getCategoryStats(req, res, next) {
    try {
      const stats = await CategoryService.getCategoryStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();