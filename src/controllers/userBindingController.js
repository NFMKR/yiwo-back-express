// src/controllers/userBindingController.js

const userBindingService = require('../services/userBindingService');

// 绑定店铺
exports.bindShop = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    const result = await userBindingService.bindShop(userId, shopId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '绑定店铺失败'
    });
  }
};

// 取消绑定店铺
exports.unbindShop = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    const result = await userBindingService.unbindShop(userId, shopId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '取消绑定失败'
    });
  }
};

// 获取用户所有绑定的店铺
exports.getBoundShops = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await userBindingService.getBoundShops(userId);

    res.status(200).json({
      success: true,
      message: '获取绑定店铺列表成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取绑定店铺列表失败'
    });
  }
};

// 添加收藏衣服
exports.addFavoriteClothes = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { clothesId } = req.body;

    if (!clothesId) {
      return res.status(400).json({
        success: false,
        message: '衣服ID不能为空'
      });
    }

    const result = await userBindingService.addFavoriteClothes(userId, clothesId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '收藏失败'
    });
  }
};

// 取消收藏衣服
exports.removeFavoriteClothes = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { clothesId } = req.params;

    if (!clothesId) {
      return res.status(400).json({
        success: false,
        message: '衣服ID不能为空'
      });
    }

    const result = await userBindingService.removeFavoriteClothes(userId, clothesId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '取消收藏失败'
    });
  }
};

// 获取用户所有收藏的衣服
exports.getFavoriteClothes = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await userBindingService.getFavoriteClothes(userId);

    res.status(200).json({
      success: true,
      message: '获取收藏列表成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取收藏列表失败'
    });
  }
};

