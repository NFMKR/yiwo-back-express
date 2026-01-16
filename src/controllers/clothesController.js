// src/controllers/clothesController.js

const clothesService = require('../services/clothesService');

// 创建衣服
exports.createClothes = async (req, res) => {
  try {
    const {
      shopId,
      positionType,
      imageUrl,
      clothesName,
      price,
      status,
      description,
      shop_qr_image_url,
      clothesId // 可选，不提供时自动生成
    } = req.body;

    // 验证必填字段（只有shopId、positionType、imageUrl是必填的，clothesId会自动生成）
    if (!shopId || !positionType || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: '请提供店铺ID、部位类型和图片URL。衣服ID会自动生成（格式：shopId-6位随机数字）'
      });
    }

    // 验证价格（如果提供了）
    if (price !== undefined && price < 0) {
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
      description,
      shop_qr_image_url
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

// 根据_id获取指定衣服详细信息
exports.getClothesById = async (req, res) => {
  try {
    const { id } = req.params; // 使用_id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '衣服ID不能为空'
      });
    }

    const result = await clothesService.getClothesById(id);

    res.status(200).json({
      success: true,
      message: '获取衣服信息成功',
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || '获取衣服信息失败'
    });
  }
};

// 根据_id修改指定衣服信息（全部字段可修改）
exports.updateClothes = async (req, res) => {
  try {
    const { id } = req.params; // 使用_id
    const {
      clothesId,
      shopId,
      clothesName,
      positionType,
      imageUrl,
      price,
      status,
      description,
      shop_qr_image_url
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '衣服ID不能为空'
      });
    }

    // 验证价格（如果提供了）
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: '价格不能为负数'
      });
    }

    const result = await clothesService.updateClothes(id, {
      clothesId,
      shopId,
      clothesName,
      positionType,
      imageUrl,
      price,
      status,
      description,
      shop_qr_image_url
    });

    res.status(200).json({
      success: true,
      message: '衣服信息更新成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '更新衣服信息失败'
    });
  }
};

// 根据衣服ID（clothesId）获取衣服的二维码
exports.getClothesQrCode = async (req, res) => {
  try {
    const { clothesId } = req.params; // 使用clothesId（不是MongoDB _id）

    if (!clothesId) {
      return res.status(400).json({
        success: false,
        message: '衣服ID不能为空'
      });
    }

    const result = await clothesService.getClothesQrCode(clothesId);

    res.status(200).json({
      success: true,
      message: '获取衣服二维码成功',
      data: result
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || '获取衣服二维码失败'
    });
  }
};

// 根据_id删除指定衣服
exports.deleteClothes = async (req, res) => {
  try {
    const { id } = req.params; // 使用_id

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '衣服ID不能为空'
      });
    }

    const result = await clothesService.deleteClothes(id);

    res.status(200).json({
      success: true,
      message: '衣服删除成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '删除衣服失败'
    });
  }
};

