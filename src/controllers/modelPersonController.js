// src/controllers/modelPersonController.js

const modelPersonService = require('../services/modelPersonService');

// 创建或更新用户的模特（上传图片后创建）
exports.createOrUpdateUserModel = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const {
      full_body_image_url,
      model_name,
      gender,
      age_stage,
      height,
      weight,
      body_feature,
      suitable_weather,
      shooting_style,
      mood,
      style_preference,
      top_garment,
      bottom_garment,
      headwear,
      accessories,
      outerwear,
      bag,
      shoes,
      other_clothing,
      description
    } = req.body;

    // 验证必填字段
    if (!full_body_image_url) {
      return res.status(400).json({
        success: false,
        message: '全身图URL不能为空'
      });
    }

    const result = await modelPersonService.createOrUpdateUserModel(userId, {
      full_body_image_url,
      model_name,
      gender,
      age_stage,
      height,
      weight,
      body_feature,
      suitable_weather,
      shooting_style,
      mood,
      style_preference,
      top_garment,
      bottom_garment,
      headwear,
      accessories,
      outerwear,
      bag,
      shoes,
      other_clothing,
      description
    });

    res.status(201).json({
      success: true,
      message: result.model.id ? '模特更新成功' : '模特创建成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '创建/更新模特失败'
    });
  }
};

// 获取用户自己的模特
exports.getUserModel = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await modelPersonService.getUserModel(userId);

    res.status(200).json({
      success: true,
      message: result.model ? '获取模特信息成功' : '用户尚未创建模特',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取模特信息失败'
    });
  }
};

// 更新当前头像
exports.updateCurrentAvatar = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { full_body_image_url } = req.body;

    if (!full_body_image_url) {
      return res.status(400).json({
        success: false,
        message: '全身图URL不能为空'
      });
    }

    const result = await modelPersonService.updateCurrentAvatar(userId, full_body_image_url);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '更新当前头像失败'
    });
  }
};

// 更新当前试穿效果图
exports.updateCurrentTryonImage = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { tryon_image_url } = req.body;

    if (!tryon_image_url) {
      return res.status(400).json({
        success: false,
        message: '试穿效果图URL不能为空'
      });
    }

    const result = await modelPersonService.updateCurrentTryonImage(userId, tryon_image_url);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '更新试穿效果图失败'
    });
  }
};

// 删除模特图片
exports.deleteModelImage = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { full_body_image_url } = req.body;

    if (!full_body_image_url) {
      return res.status(400).json({
        success: false,
        message: '全身图URL不能为空'
      });
    }

    const result = await modelPersonService.deleteModelImage(userId, full_body_image_url);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '删除图片失败'
    });
  }
};
