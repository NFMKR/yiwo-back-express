// src/controllers/shopController.js

const shopService = require('../services/shopService');
const qrcodeService = require('../services/qrcodeService');

// 创建商家店铺
exports.createShop = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { 
      shopId, 
      shopName, 
      avatarUrl, 
      qrcodeUrl, 
      background_image_url,
      memberLevel, 
      wechatId 
    } = req.body;

    // 所有字段都是可选的，shopId会自动生成，其他字段有默认值

    const result = await shopService.createShop(userId, {
      shopId,
      shopName,
      avatarUrl,
      qrcodeUrl,
      background_image_url,
      memberLevel,
      wechatId
    });

    res.status(201).json({
      success: true,
      message: '商家店铺创建成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '创建商家店铺失败'
    });
  }
};

// 更新店铺信息
exports.updateShop = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { shopId } = req.params; // 可以是MongoDB _id或shopId字符串
    const updateData = req.body;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    // 验证请求体是否为有效的JSON对象
    if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
      return res.status(400).json({
        success: false,
        message: '请求体必须是有效的JSON对象'
      });
    }

    const result = await shopService.updateShop(userId, shopId, updateData);

    res.status(200).json({
      success: true,
      message: '店铺信息更新成功',
      data: result
    });
  } catch (error) {
    console.error('更新店铺信息失败:', error);
    res.status(400).json({
      success: false,
      message: error.message || '更新店铺信息失败'
    });
  }
};

// 获取用户全部店铺
exports.getUserShops = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await shopService.getUserShops(userId);

    res.status(200).json({
      success: true,
      message: '获取店铺列表成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取店铺列表失败'
    });
  }
};

// 删除店铺
exports.deleteShop = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { shopId } = req.params; // 店铺的_id（MongoDB ObjectId）

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    const result = await shopService.deleteShop(userId, shopId);

    res.status(200).json({
      success: true,
      message: '店铺删除成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '删除店铺失败'
    });
  }
};

// 获取指定店铺的全部信息
exports.getShopInfo = async (req, res) => {
  try {
    const userId = req.user?.userId || null; // 从认证中间件获取（可选）
    const { shopId } = req.params; // 可以是MongoDB _id或shopId字符串

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    const result = await shopService.getShopInfo(shopId, userId);

    res.status(200).json({
      success: true,
      message: '获取店铺信息成功',
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || '获取店铺信息失败'
    });
  }
};

// 生成店铺小程序二维码并上传到云存储
exports.generateShopQRCode = async (req, res) => {
  try {
    const { shopId } = req.params; // 可以是MongoDB _id或shopId字符串
    const { page, width } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    // 获取店铺信息（支持MongoDB _id或shopId字符串）
    const shopInfo = await shopService.getShopInfo(shopId);
    if (!shopInfo || !shopInfo.shop) {
      return res.status(404).json({
        success: false,
        message: '店铺不存在'
      });
    }

    const shop = shopInfo.shop;

    // 生成并上传二维码
    const result = await qrcodeService.generateAndUploadQRCode(shop.shopId, {
      page: page || 'pages/index/index',
      width: width ? parseInt(width) : 430
    });

    res.status(200).json({
      success: true,
      message: '二维码生成并上传成功',
      data: result
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    res.status(400).json({
      success: false,
      message: error.message || '生成二维码失败'
    });
  }
};
