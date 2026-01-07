const express = require('express');
const router = express.Router();

// 中间件
const authMiddleware = require('../middlewares/authMiddleware');

// 控制器
const { 
  register, 
  login, 
  logout, 
  getUserInfo, 
  getUsers 
} = require('../controllers/userController');

const {
  createTryOnTask,
  getTaskResult,
  getUserTasks,
  createTestTask
} = require('../controllers/wearController');

// ==================== 用户路由 ====================

// 公开路由（不需要认证）
router.post('/users/register', register);        // 用户注册
router.post('/users/login', login);              // 用户登录

// 受保护路由（需要认证）
router.post('/users/logout', authMiddleware, logout);           // 用户退出
router.get('/users/me', authMiddleware, getUserInfo);           // 获取当前用户信息
router.get('/users', authMiddleware, getUsers);                 // 获取所有用户（可选）

// ==================== AI试穿路由 ====================

// 所有AI试穿路由都需要认证
router.post('/wear/try-on', authMiddleware, createTryOnTask);              // 创建试穿任务
router.get('/wear/tasks/:taskId', authMiddleware, getTaskResult);          // 查询任务结果
router.get('/wear/tasks', authMiddleware, getUserTasks);                   // 获取用户所有任务
router.post('/wear/try-on/test', authMiddleware, createTestTask);          // 创建测试任务（使用默认值）

// ==================== 健康检查 ====================
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
