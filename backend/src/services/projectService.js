const Project = require('../models/Project');
const Category = require('../models/Category');
const User = require('../models/User');
const Report = require('../models/Report');
const { AppError } = require('../utils/errorHandler');

class ProjectService {
  //Create a new project
  async createProject(userId, projectData) {
    const {
      project_name,
      description,
      category,
      assigned_users,
      start_date,
      end_date,
      budget,
      priority,
      status,
      tags
    } = projectData;

    // Check if project name already exists
    const existingProject = await Project.findOne({ project_name });
    if (existingProject) {
      throw new AppError('Project name already exists', 409);
    }

    // Validate category exists
    const categoryExists = await Category.findOne({ 
      name: category,
      is_active: true 
    });
    if (!categoryExists) {
      throw new AppError('Category not found or inactive', 404);
    }

    // Validate assigned users exist
    if (assigned_users && assigned_users.length > 0) {
      const validUsers = await User.find({
        _id: { $in: assigned_users },
        isActive: true
      });
      if (validUsers.length !== assigned_users.length) {
        throw new AppError('Some assigned users are invalid or inactive', 400);
      }
    }

    // Create project
    const project = new Project({
      project_name,
      description: description || '',
      category,
      assigned_users: assigned_users || [],
      created_by: userId,
      start_date,
      end_date,
      budget,
      priority: priority || 'medium',
      status: status || 'planning',
      tags: tags || []
    });

    await project.save();

    // Update category project count
    await Category.findByIdAndUpdate(categoryExists._id, {
      $inc: { project_count: 1 }
    });

    return project;
  }

  //Get all projects with filters
  async getProjects(filters = {}, userId = null) {
    const query = {};

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.is_active !== undefined) {
      query.is_active = filters.is_active === 'true';
    }

    if (filters.search) {
      query.$or = [
        { project_name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Filter by assigned user
    if (filters.user_id) {
      query.assigned_users = { $in: [filters.user_id] };
    }

    // Filter by priority
    if (filters.priority) {
      query.priority = filters.priority;
    }

    const projects = await Project.find(query)
      .populate('assigned_users', 'first_name last_name email user_id')
      .populate('created_by', 'first_name last_name email')
      .sort({ createdAt: -1 });

    // Get report counts for each project
    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const reportCount = await Report.countDocuments({
        project: project.project_name,
        status: 'submitted'
      });

      const projectObj = project.toJSON();
      projectObj.report_count = reportCount;
      return projectObj;
    }));

    return projectsWithStats;
  }

  //Get project by ID
  async getProjectById(projectId) {
    const project = await Project.findById(projectId)
      .populate('assigned_users', 'first_name last_name email user_id role')
      .populate('created_by', 'first_name last_name email');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get report count
    const reportCount = await Report.countDocuments({
      project: project.project_name,
      status: 'submitted'
    });

    const projectObj = project.toJSON();
    projectObj.report_count = reportCount;

    return projectObj;
  }

  //Get project by project_id
  async getProjectByProjectId(project_id) {
    const project = await Project.findOne({ project_id })
      .populate('assigned_users', 'first_name last_name email user_id role')
      .populate('created_by', 'first_name last_name email');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  //Update project
  async updateProject(projectId, userId, updateData) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is authorized (admin or project creator)
    if (project.created_by.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== 'admin' && user.role !== 'manager') {
        throw new AppError('Not authorized to update this project', 403);
      }
    }

    // Check if project name already taken
    if (updateData.project_name && updateData.project_name !== project.project_name) {
      const existingProject = await Project.findOne({ 
        project_name: updateData.project_name 
      });
      if (existingProject) {
        throw new AppError('Project name already exists', 409);
      }
    }

    // Validate category if updating
    if (updateData.category && updateData.category !== project.category) {
      const categoryExists = await Category.findOne({ 
        name: updateData.category,
        is_active: true 
      });
      if (!categoryExists) {
        throw new AppError('Category not found or inactive', 404);
      }

      // Update category counts
      await Category.findOneAndUpdate(
        { name: project.category },
        { $inc: { project_count: -1 } }
      );
      await Category.findByIdAndUpdate(categoryExists._id, {
        $inc: { project_count: 1 }
      });
    }

    // Validate assigned users
    if (updateData.assigned_users) {
      const validUsers = await User.find({
        _id: { $in: updateData.assigned_users },
        isActive: true
      });
      if (validUsers.length !== updateData.assigned_users.length) {
        throw new AppError('Some assigned users are invalid or inactive', 400);
      }
    }

    // Update fields
    const allowedUpdates = [
      'project_name', 'description', 'category', 'assigned_users',
      'start_date', 'end_date', 'budget', 'priority', 'status',
      'tags', 'is_active'
    ];

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        project[field] = updateData[field];
      }
    });

    await project.save();

    return project.populate('assigned_users', 'first_name last_name email user_id');
  }

  //Delete project
  async deleteProject(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is authorized
    const user = await User.findById(userId);
    if (project.created_by.toString() !== userId.toString() && 
        user.role !== 'admin' && user.role !== 'manager') {
      throw new AppError('Not authorized to delete this project', 403);
    }

    // Check if project has reports
    const reportCount = await Report.countDocuments({
      project: project.project_name
    });

    if (reportCount > 0) {
      throw new AppError(`Cannot delete project with ${reportCount} associated reports. Archive it instead.`, 400);
    }

    // Update category count
    await Category.findOneAndUpdate(
      { name: project.category },
      { $inc: { project_count: -1 } }
    );

    await project.deleteOne();
    return { message: 'Project deleted successfully' };
  }

  //Assign users to project
  async assignUsersToProject(projectId, userIds) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Validate users exist
    const validUsers = await User.find({
      _id: { $in: userIds },
      isActive: true
    });

    if (validUsers.length !== userIds.length) {
      throw new AppError('Some users are invalid or inactive', 400);
    }

    // Add users (avoid duplicates)
    const existingUsers = project.assigned_users.map(id => id.toString());
    const newUsers = userIds.filter(id => !existingUsers.includes(id));

    project.assigned_users = [...project.assigned_users, ...newUsers];
    await project.save();

    return project.populate('assigned_users', 'first_name last_name email user_id');
  }

  //Remove users from project
  async removeUsersFromProject(projectId, userIds) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    project.assigned_users = project.assigned_users.filter(
      id => !userIds.includes(id.toString())
    );

    await project.save();
    return project.populate('assigned_users', 'first_name last_name email user_id');
  }

  //Get projects by category
  async getProjectsByCategory(categoryName) {
    const projects = await Project.find({
      category: categoryName,
      is_active: true
    }).populate('assigned_users', 'first_name last_name email');

    return projects;
  }

  //Get project statistics
  async getProjectStats() {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ is_active: true });
    const completedProjects = await Project.countDocuments({ status: 'completed' });

    // Projects by status
    const statusStats = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Projects by category
    const categoryStats = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Projects by priority
    const priorityStats = await Project.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      byStatus: statusStats,
      byCategory: categoryStats,
      byPriority: priorityStats
    };
  }

  //Get projects for a specific user
  async getUserProjects(userId) {
    const projects = await Project.find({
      assigned_users: { $in: [userId] },
      is_active: true
    }).select('project_name project_id description category status priority');

    return projects;
  }

  //Archive project (soft delete)
  async archiveProject(projectId, userId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    project.is_active = false;
    project.status = 'archived';
    await project.save();

    return project;
  }

  //Restore archived project
  async restoreProject(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    project.is_active = true;
    project.status = 'active';
    await project.save();

    return project;
  }
}

module.exports = new ProjectService();