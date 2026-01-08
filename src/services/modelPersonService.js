// src/services/modelPersonService.js

const ModelPerson = require('../models/modelPersonModel');

// 添加模特
exports.addModel = async (modelData) => {
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
    } = modelData;

    // 检查模特ID是否已存在
    const existingModel = await ModelPerson.findOne({ modelId });
    if (existingModel) {
      throw new Error('模特ID已存在');
    }

    // 创建新模特
    const model = new ModelPerson({
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
      description: description || '',
      status: status || '启用'
    });

    await model.save();

    return {
      model: {
        id: model._id,
        modelId: model.modelId,
        modelName: model.modelName,
        avatarUrl: model.avatarUrl,
        fullBodyImageUrl: model.fullBodyImageUrl,
        gender: model.gender,
        ageStage: model.ageStage,
        bodyFeature: model.bodyFeature,
        personStyle: model.personStyle,
        heightStage: model.heightStage,
        weightStage: model.weightStage,
        description: model.description,
        status: model.status,
        createdAt: model.createdAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 获取模特列表（支持分类筛选）
exports.getModels = async (filters = {}, options = {}) => {
  try {
    const {
      gender,
      ageStage,
      bodyFeature,
      personStyle,
      heightStage,
      weightStage,
      status = '启用'
    } = filters;

    const { page = 1, limit = 20 } = options;

    // 构建查询条件
    const query = { status };

    // 添加筛选条件
    if (gender) query.gender = gender;
    if (ageStage) query.ageStage = ageStage;
    if (bodyFeature) query.bodyFeature = bodyFeature;
    if (personStyle) query.personStyle = personStyle;
    if (heightStage) query.heightStage = heightStage;
    if (weightStage) query.weightStage = weightStage;

    // 查询模特列表
    const models = await ModelPerson.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    const total = await ModelPerson.countDocuments(query);

    return {
      models,
      filters: {
        gender: gender || '全部',
        ageStage: ageStage || '全部',
        bodyFeature: bodyFeature || '全部',
        personStyle: personStyle || '全部',
        heightStage: heightStage || '全部',
        weightStage: weightStage || '全部',
        status
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// 获取所有可用的筛选选项（用于前端显示筛选器）
exports.getFilterOptions = () => {
  return {
    gender: ['男', '女', '中性'],
    ageStage: ['儿童', '青少年', '青年', '中年', '老年'],
    bodyFeature: ['纤瘦', '标准', '健壮', '丰满', '运动型'],
    personStyle: ['休闲', '商务', '时尚', '运动', '甜美', '帅气', '优雅', '街头'],
    heightStage: ['150cm以下', '150-160cm', '160-170cm', '170-180cm', '180cm以上'],
    weightStage: ['40kg以下', '40-50kg', '50-60kg', '60-70kg', '70-80kg', '80kg以上'],
    status: ['启用', '禁用']
  };
};

