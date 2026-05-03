const Project = require('../models/Project');

// 创建项目
exports.createProject = async (req, res) => {
  try {
    const { name, description, location, capacity } = req.body;

    const newProject = await Project.create({
      name,
      description,
      location,
      capacity,
      userId: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        project: newProject,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 获取所有项目
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });

    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: {
        projects,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 获取单个项目
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    // 检查项目是否属于当前用户
    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this project',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        project,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 更新项目
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    // 检查项目是否属于当前用户
    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this project',
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        project: updatedProject,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 删除项目
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    // 检查项目是否属于当前用户
    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// 更新地形数据
exports.updateTerrainData = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found',
      });
    }

    // 检查项目是否属于当前用户
    if (project.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this project',
      });
    }

    const { elevation, slope, solarRadiation } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { terrainData: { elevation, slope, solarRadiation } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        project: updatedProject,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};