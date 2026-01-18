// src/controllers/modelPersonController.js

const modelPersonService = require('../services/modelPersonService');

// 创建或更新用户的模特
exports.createOrUpdateUserModel = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const {
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
      top_garment_id,
      bottom_garment,
      bottom_garment_id,
      headwear,
      headwear_id,
      accessories,
      accessories_id,
      outerwear,
      outerwear_id,
      bag,
      bag_id,
      shoes,
      shoes_id,
      other_clothing,
      other_clothing_id,
      description,
      current_avatar_url,
      current_tryon_image_url
    } = req.body;

    const result = await modelPersonService.createOrUpdateUserModel(userId, {
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
      top_garment_id,
      bottom_garment,
      bottom_garment_id,
      headwear,
      headwear_id,
      accessories,
      accessories_id,
      outerwear,
      outerwear_id,
      bag,
      bag_id,
      shoes,
      shoes_id,
      other_clothing,
      other_clothing_id,
      description,
      current_avatar_url,
      current_tryon_image_url
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
    const { avatar_images_url } = req.body; // 使用avatar_images_url参数名

    if (!avatar_images_url) {
      return res.status(400).json({
        success: false,
        message: '头像URL不能为空'
      });
    }

    const result = await modelPersonService.updateCurrentAvatar(userId, avatar_images_url);

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

// 删除模特图片（通过avatar_images_url）
exports.deleteModelImage = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { avatar_images_url } = req.body; // 使用avatar_images_url参数名

    if (!avatar_images_url) {
      return res.status(400).json({
        success: false,
        message: '头像URL不能为空'
      });
    }

    const result = await modelPersonService.deleteModelImage(userId, avatar_images_url);

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

// 修改模特信息（不包含图片相关字段）
exports.updateModelInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const updateData = req.body;

    // 验证请求体是否为有效的JSON对象
    if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
      return res.status(400).json({
        success: false,
        message: '请求体必须是有效的JSON对象'
      });
    }

    // 添加调试日志
    console.log('更新模特信息请求数据:', {
      userId,
      updateData: JSON.stringify(updateData),
      keys: Object.keys(updateData)
    });

    const result = await modelPersonService.updateModelInfo(userId, updateData);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '更新模特信息失败'
    });
  }
};

// 上传头像并自动添加到数组（封装上传逻辑）
exports.addModelAvatar = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片文件'
      });
    }

    console.log('上传头像请求:', {
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path
    });

    const result = await modelPersonService.addModelAvatar(userId, req.file);

    console.log('头像上传成功:', {
      userId,
      avatarId: result.avatar?.model_avatar_id,
      avatarUrl: result.avatar?.avatar_images_url
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('上传头像失败:', {
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack
    });
    res.status(400).json({
      success: false,
      message: error.message || '上传头像失败'
    });
  }
};

// 通过model_avatar_id删除头像
exports.deleteModelAvatarById = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { model_avatar_id } = req.body;

    if (!model_avatar_id) {
      return res.status(400).json({
        success: false,
        message: '头像ID不能为空'
      });
    }

    const result = await modelPersonService.deleteModelAvatarById(userId, model_avatar_id);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '删除头像失败'
    });
  }
};

// 获取模特头像列表
exports.getModelAvatars = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await modelPersonService.getModelAvatars(userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取头像列表失败'
    });
  }
};
