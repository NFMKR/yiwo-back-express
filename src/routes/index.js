const express = require('express');
const router = express.Router();

// 中间件
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadSingle, handleUploadError } = require('../middlewares/uploadMiddleware');

// 控制器
const { 
  wechatLogin,
  logout, 
  getUserInfo,
  updateUserInfo,
  deleteAccount,
  getUsers 
} = require('../controllers/userController');

const {
  createTryOnTask,
  getTaskResult,
  getUserTasks,
  getUserTryOnRecords
} = require('../controllers/wearController');

const {
  createShop,
  updateShop,
  getUserShops,
  deleteShop,
  getShopInfo,
  generateShopQRCode
} = require('../controllers/shopController');

const {
  createClothes,
  getClothesByShopId,
  getClothesById,
  updateClothes,
  deleteClothes
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
  createOrUpdateUserModel,
  getUserModel,
  updateModelInfo,
  updateCurrentAvatar,
  updateCurrentTryonImage,
  deleteModelImage,
  addModelAvatar,
  deleteModelAvatarById,
  getModelAvatars
} = require('../controllers/modelPersonController');

const {
  uploadFile
} = require('../controllers/fileController');

// ==================== 用户路由 ====================

// 公开路由（不需要认证）
router.post('/users/wechat-login', wechatLogin);                // 微信小程序一键登录/注册

// 受保护路由（需要认证）
router.post('/users/logout', authMiddleware, logout);           // 用户退出
router.get('/users/me', authMiddleware, getUserInfo);          // 获取当前用户信息
router.put('/users/me', authMiddleware, updateUserInfo);       // 更新用户信息
router.delete('/users/me', authMiddleware, deleteAccount);     // 注销账号
router.get('/users', authMiddleware, getUsers);                 // 获取所有用户（测试用）

// ==================== AI试穿路由 ====================

// 所有AI试穿路由都需要认证
router.post('/wear/try-on', authMiddleware, createTryOnTask);              // 创建试穿任务
router.get('/wear/tasks/:taskId', authMiddleware, getTaskResult);          // 查询任务结果
router.get('/wear/tasks', authMiddleware, getUserTasks);                   // 获取用户所有任务
router.get('/wear/records', authMiddleware, getUserTryOnRecords);          // 获取用户试穿记录

// ==================== 商家店铺路由 ====================

// 店铺管理接口（需要认证）
router.post('/shop/create', authMiddleware, createShop);                   // 创建店铺
router.get('/shop/my', authMiddleware, getUserShops);                     // 获取用户全部店铺（需要放在具体路由之前）
router.get('/shop/:shopId', authMiddleware, getShopInfo);                 // 获取指定店铺全部信息
router.put('/shop/:shopId', authMiddleware, updateShop);                  // 更新店铺信息
router.delete('/shop/:shopId', authMiddleware, deleteShop);               // 删除店铺
router.post('/shop/:shopId/qrcode', authMiddleware, generateShopQRCode);   // 生成店铺小程序二维码并上传

// ==================== 衣服管理路由 ====================

// 衣服相关接口（需要认证）
router.post('/clothes/create', authMiddleware, createClothes);             // 创建衣服
router.get('/clothes/shop/:shopId', authMiddleware, getClothesByShopId);   // 获取指定店铺的所有衣服（需要放在具体路由之前）
router.get('/clothes/:id', authMiddleware, getClothesById);                // 根据_id获取指定衣服详细信息
router.put('/clothes/:id', authMiddleware, updateClothes);                 // 根据_id修改指定衣服信息
router.delete('/clothes/:id', authMiddleware, deleteClothes);               // 根据_id删除指定衣服

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

// 用户模特相关接口（需要认证，1:1关系）
router.post('/models/create', authMiddleware, createOrUpdateUserModel);   // 创建或更新用户模特（上传图片）
router.get('/models/my', authMiddleware, getUserModel);                  // 获取用户自己的模特
router.put('/models/info', authMiddleware, updateModelInfo);             // 修改模特信息（不包含图片）
router.put('/models/current-avatar', authMiddleware, updateCurrentAvatar); // 更新当前头像
router.put('/models/current-tryon', authMiddleware, updateCurrentTryonImage); // 更新当前试穿效果图
router.delete('/models/image', authMiddleware, deleteModelImage);        // 删除模特图片（通过URL，兼容接口）

// 模特头像管理接口
router.post('/models/avatar', authMiddleware, uploadSingle('file'), handleUploadError, addModelAvatar); // 上传头像并自动添加到数组
router.get('/models/avatars', authMiddleware, getModelAvatars);           // 获取模特头像列表
router.delete('/models/avatar', authMiddleware, deleteModelAvatarById);  // 通过model_avatar_id删除头像

// ==================== 文件上传路由 ====================

// 单文件上传接口（需要认证，Bearer Token）
router.post('/upload', authMiddleware, uploadSingle('file'), handleUploadError, uploadFile);

// ==================== 健康检查 ====================
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
