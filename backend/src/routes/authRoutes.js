const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// 注册用户
router.post('/signup', authController.signup);

// 登录用户
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;