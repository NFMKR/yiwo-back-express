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

const {
  createShop
} = require('../controllers/shopController');

const {
  createClothes,
  getClothesByShopId
} = require('../controllers/clothesController');

const {
  bindShop,
  unbindShop,
  getBoundShops,
  addFavoriteClothes,
  removeFavoriteClothes,
  getFavoriteClothes
} = require('../controllers/userBindingController');

const {
  addModel,
  getModels,
  getFilterOptions
} = require('../controllers/modelPersonController');

// ==================== 用户路由 ====================

// 公开路由（不需要认证）
router.post('/users/register', register);        // 用户注册
router.post('/users/login', login);              // 用户登录

// 受保护路由（需要认证）
router.post('/users/logout', authMiddleware, logout);           // 用户退出
router.get('/users/me', authMiddleware, getUserInfo);           // 获取当前用户信息
router.get('/users', authMiddleware, getUsers);                 // 获取所有用户

// ==================== AI试穿路由 ====================

// 所有AI试穿路由都需要认证
router.post('/wear/try-on', authMiddleware, createTryOnTask);              // 创建试穿任务
router.get('/wear/tasks/:taskId', authMiddleware, getTaskResult);          // 查询任务结果
router.get('/wear/tasks', authMiddleware, getUserTasks);                   // 获取用户所有任务

// ==================== 商家店铺路由 ====================

// 创建商家店铺（需要认证）
router.post('/shop/create', authMiddleware, createShop);                   // 创建商家店铺

// ==================== 衣服管理路由 ====================

// 衣服相关接口（需要认证）
router.post('/clothes/create', authMiddleware, createClothes);             // 创建衣服
router.get('/clothes/shop/:shopId', authMiddleware, getClothesByShopId);   // 获取指定店铺的所有衣服

// ==================== 用户绑定路由 ====================

// 店铺绑定相关接口（需要认证）
router.post('/binding/shop', authMiddleware, bindShop);                    // 绑定店铺
router.delete('/binding/shop/:shopId', authMiddleware, unbindShop);        // 取消绑定店铺
router.get('/binding/shops', authMiddleware, getBoundShops);               // 获取所有绑定的店铺

// 衣服收藏相关接口（需要认证）
router.post('/binding/favorite', authMiddleware, addFavoriteClothes);      // 添加收藏衣服
router.delete('/binding/favorite/:clothesId', authMiddleware, removeFavoriteClothes); // 取消收藏衣服
router.get('/binding/favorites', authMiddleware, getFavoriteClothes);      // 获取所有收藏的衣服

// ==================== 模特管理路由 ====================

// 模特相关接口（需要认证）
router.post('/models/add', authMiddleware, addModel);                      // 添加模特
router.get('/models', getModels);                          // 获取模特列表（支持分类筛选）
router.get('/models/filter-options', authMiddleware, getFilterOptions);   // 获取筛选选项

// ==================== 健康检查 ====================
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
