const ProjectService = require('../services/projectService');
const { AppError } = require('../utils/errorHandler');

class ProjectController {
  //Create a new project
  async createProject(req, res, next) {
    try {
      const userId = req.user._id;
      const projectData = req.body;

      const project = await ProjectService.createProject(userId, projectData);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get all projects
  async getProjects(req, res, next) {
    try {
      const filters = req.query;
      const userId = req.user._id;

      const projects = await ProjectService.getProjects(filters, userId);

      res.status(200).json({
        success: true,
        count: projects.length,
        data: { projects }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get project by ID
  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;

      const project = await ProjectService.getProjectById(id);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get project by project_id
  async getProjectByProjectId(req, res, next) {
    try {
      const { project_id } = req.params;

      const project = await ProjectService.getProjectByProjectId(project_id);

      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Update project
  async updateProject(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      const project = await ProjectService.updateProject(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Delete project
  async deleteProject(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const result = await ProjectService.deleteProject(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  //Assign users to project
  async assignUsers(req, res, next) {
    try {
      const { id } = req.params;
      const { user_ids } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        throw new AppError('User IDs array is required', 400);
      }

      const project = await ProjectService.assignUsersToProject(id, user_ids);

      res.status(200).json({
        success: true,
        message: 'Users assigned successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Remove users from project
  async removeUsers(req, res, next) {
    try {
      const { id } = req.params;
      const { user_ids } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        throw new AppError('User IDs array is required', 400);
      }

      const project = await ProjectService.removeUsersFromProject(id, user_ids);

      res.status(200).json({
        success: true,
        message: 'Users removed successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get projects by category
  async getProjectsByCategory(req, res, next) {
    try {
      const { category } = req.params;

      const projects = await ProjectService.getProjectsByCategory(category);

      res.status(200).json({
        success: true,
        count: projects.length,
        data: { projects }
      });
    } catch (error) {
      next(error);
    }
  }

  //Get project statistics
  async getProjectStats(req, res, next) {
    try {
      const stats = await ProjectService.getProjectStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  //Get user's projects
  async getUserProjects(req, res, next) {
    try {
      const userId = req.user._id;

      const projects = await ProjectService.getUserProjects(userId);

      res.status(200).json({
        success: true,
        count: projects.length,
        data: { projects }
      });
    } catch (error) {
      next(error);
    }
  }

  //Archive project
  async archiveProject(req, res, next) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const project = await ProjectService.archiveProject(id, userId);

      res.status(200).json({
        success: true,
        message: 'Project archived successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  //Restore project
  async restoreProject(req, res, next) {
    try {
      const { id } = req.params;

      const project = await ProjectService.restoreProject(id);

      res.status(200).json({
        success: true,
        message: 'Project restored successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();