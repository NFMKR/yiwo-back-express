// src/controllers/shopController.js

const shopService = require('../services/shopService');

// 创建商家店铺
exports.createShop = async (req, res) => {
  try {
    const { shopId, shopName, avatarUrl, qrcodeUrl, memberLevel, wechatId } = req.body;

    // 验证必填字段
    if (!shopId || !shopName || !avatarUrl || !qrcodeUrl || !wechatId) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的店铺信息（店铺ID、店铺名称、头像URL、二维码URL、微信号）'
      });
    }

    const result = await shopService.createShop({
      shopId,
      shopName,
      avatarUrl,
      qrcodeUrl,
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

