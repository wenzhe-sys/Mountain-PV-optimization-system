const express = require('express');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// 所有项目路由都需要认证
router.use(authMiddleware.protect);

// 创建项目
router.post('/create', projectController.createProject);

// 获取所有项目
router.get('/all', projectController.getAllProjects);

// 获取单个项目
router.get('/:id', projectController.getProject);

// 更新项目
router.put('/:id', projectController.updateProject);

// 删除项目
router.delete('/:id', projectController.deleteProject);

// 更新地形数据
router.put('/:id/terrain', projectController.updateTerrainData);

module.exports = router;