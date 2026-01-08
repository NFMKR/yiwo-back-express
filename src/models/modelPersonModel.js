// src/models/modelPersonModel.js

const mongoose = require('mongoose');

const modelPersonSchema = new mongoose.Schema({
  modelId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  fullBodyImageUrl: {
    type: String,
    required: true
  },
  // 特征参数
  gender: {
    type: String,
    required: true,
    enum: ['男', '女', '中性'],
    index: true
  },
  ageStage: {
    type: String,
    required: true,
    enum: ['儿童', '青少年', '青年', '中年', '老年'],
    index: true
  },
  bodyFeature: {
    type: String,
    required: true,
    enum: ['纤瘦', '标准', '健壮', '丰满', '运动型'],
    index: true
  },
  personStyle: {
    type: String,
    required: true,
    enum: ['休闲', '商务', '时尚', '运动', '甜美', '帅气', '优雅', '街头'],
    index: true
  },
  heightStage: {
    type: String,
    required: true,
    enum: ['150cm以下', '150-160cm', '160-170cm', '170-180cm', '180cm以上'],
    index: true
  },
  weightStage: {
    type: String,
    required: true,
    enum: ['40kg以下', '40-50kg', '50-60kg', '60-70kg', '70-80kg', '80kg以上'],
    index: true
  },
  // 可选描述
  description: {
    type: String,
    default: '',
    trim: true
  },
  // 状态
  status: {
    type: String,
    enum: ['启用', '禁用'],
    default: '启用',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 复合索引：用于多条件筛选
modelPersonSchema.index({ gender: 1, ageStage: 1, bodyFeature: 1 });
modelPersonSchema.index({ personStyle: 1, status: 1 });

// 更新时间戳
modelPersonSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('ModelPerson', modelPersonSchema);

