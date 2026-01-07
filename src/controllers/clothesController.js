// src/controllers/clothesController.js

const clothesService = require('../services/clothesService');

// 创建衣服
exports.createClothes = async (req, res) => {
  try {
    const {
      clothesId,
      shopId,
      clothesName,
      positionType,
      imageUrl,
      price,
      status,
      description
    } = req.body;

    // 验证必填字段
    if (!clothesId || !shopId || !clothesName || !positionType || !imageUrl || price === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的衣服信息（衣服ID、店铺ID、衣服名称、部位类型、图片URL、价格）'
      });
    }

    // 验证价格
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: '价格不能为负数'
      });
    }

    const result = await clothesService.createClothes({
      clothesId,
      shopId,
      clothesName,
      positionType,
      imageUrl,
      price,
      status,
      description
    });

    res.status(201).json({
      success: true,
      message: '衣服创建成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '创建衣服失败'
    });
  }
};

// 获取指定店铺的所有衣服
exports.getClothesByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page, limit, status, positionType } = req.query;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '店铺ID不能为空'
      });
    }

    const options = {};
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);
    if (status) options.status = status;
    if (positionType) options.positionType = positionType;

    const result = await clothesService.getClothesByShopId(shopId, options);

    res.status(200).json({
      success: true,
      message: '获取衣服列表成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取衣服列表失败'
    });
  }
};

