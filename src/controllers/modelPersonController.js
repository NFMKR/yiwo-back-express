// src/controllers/modelPersonController.js

const modelPersonService = require('../services/modelPersonService');

// 添加模特
exports.addModel = async (req, res) => {
  try {
    const {
      modelId,
      modelName,
      avatarUrl,
      fullBodyImageUrl,
      gender,
      ageStage,
      bodyFeature,
      personStyle,
      heightStage,
      weightStage,
      description,
      status
    } = req.body;

    // 验证必填字段
    if (!modelId || !modelName || !avatarUrl || !fullBodyImageUrl || 
        !gender || !ageStage || !bodyFeature || !personStyle || 
        !heightStage || !weightStage) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的模特信息（模特ID、姓名、头像URL、全身照URL、性别、年龄阶段、身体特征、人物风格、身高阶段、体重阶段）'
      });
    }

    const result = await modelPersonService.addModel({
      modelId,
      modelName,
      avatarUrl,
      fullBodyImageUrl,
      gender,
      ageStage,
      bodyFeature,
      personStyle,
      heightStage,
      weightStage,
      description,
      status
    });

    res.status(201).json({
      success: true,
      message: '模特添加成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '添加模特失败'
    });
  }
};

// 获取模特列表（支持分类筛选）
exports.getModels = async (req, res) => {
  try {
    const {
      gender,
      ageStage,
      bodyFeature,
      personStyle,
      heightStage,
      weightStage,
      status,
      page,
      limit
    } = req.query;

    // 构建筛选条件
    const filters = {};
    if (gender) filters.gender = gender;
    if (ageStage) filters.ageStage = ageStage;
    if (bodyFeature) filters.bodyFeature = bodyFeature;
    if (personStyle) filters.personStyle = personStyle;
    if (heightStage) filters.heightStage = heightStage;
    if (weightStage) filters.weightStage = weightStage;
    if (status) filters.status = status;

    // 构建分页选项
    const options = {};
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);

    const result = await modelPersonService.getModels(filters, options);

    res.status(200).json({
      success: true,
      message: '获取模特列表成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取模特列表失败'
    });
  }
};

// 获取筛选选项
exports.getFilterOptions = async (req, res) => {
  try {
    const options = modelPersonService.getFilterOptions();

    res.status(200).json({
      success: true,
      message: '获取筛选选项成功',
      data: options
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取筛选选项失败'
    });
  }
};

