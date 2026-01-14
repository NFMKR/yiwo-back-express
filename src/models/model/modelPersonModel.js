// src/models/model/modelPersonModel.js

const mongoose = require('mongoose');

// 模特图片数组中的单个图片对象结构
const modelImageSchema = new mongoose.Schema({
  model_avatar_id: {
    type: String,
    required: false, // 改为非必填，兼容旧数据
    unique: false // 在数组中不需要唯一索引，但值应该是唯一的
  },
  full_body_image_url: {
    type: String,
    required: true
  }
}, { _id: false });

const modelPersonSchema = new mongoose.Schema({
  // 绑定用户（1:1关系）
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // 模特ID（可选，用于兼容）
  model_id: {
    type: String,
    default: null,
    trim: true
  },
  // 模特名字
  model_name: {
    type: String,
    default: '',
    trim: true
  },
  // 头像URL数组（每个元素包含全身图）
  avatar_images: {
    type: [modelImageSchema],
    default: []
  },
  // 当前模特头像URL
  current_avatar_url: {
    type: String,
    default: ''
  },
  // 当前试穿效果图URL
  current_tryon_image_url: {
    type: String,
    default: ''
  },
  // 性别
  gender: {
    type: String,
    enum: ['男', '女', '中性'],
    default: null,
    index: true
  },
  // 年龄阶段
  age_stage: {
    type: String,
    enum: ['儿童', '青少年', '青年', '中年', '老年'],
    default: null,
    index: true
  },
  // 身高（单位：cm）
  height: {
    type: Number,
    default: null,
    min: 0,
    max: 300
  },
  // 体重（单位：kg）
  weight: {
    type: Number,
    default: null,
    min: 0,
    max: 300
  },
  // 身体特征
  body_feature: {
    type: String,
    enum: ['纤瘦', '标准', '健壮', '丰满', '运动型'],
    default: null,
    index: true
  },
  // 适合天气
  suitable_weather: {
    type: String,
    enum: ['春季', '夏季', '秋季', '冬季', '四季'],
    default: null
  },
  // 拍摄风格
  shooting_style: {
    type: String,
    enum: ['自然', '时尚', '商务', '休闲', '运动', '甜美', '帅气', '优雅', '街头', '其他'],
    default: null
  },
  // 心情
  mood: {
    type: String,
    enum: ['开心', '平静', '兴奋', '优雅', '酷炫', '甜美', '其他'],
    default: null
  },
  // 风格偏好
  style_preference: {
    type: String,
    enum: ['简约', '复古', '潮流', '经典', '个性', '甜美', '帅气', '优雅', '其他'],
    default: null
  },
  // 上装
  top_garment: {
    type: String,
    default: ''
  },
  // 下装
  bottom_garment: {
    type: String,
    default: ''
  },
  // 头饰
  headwear: {
    type: String,
    default: ''
  },
  // 配饰
  accessories: {
    type: String,
    default: ''
  },
  // 外套
  outerwear: {
    type: String,
    default: ''
  },
  // 包袋
  bag: {
    type: String,
    default: ''
  },
  // 鞋
  shoes: {
    type: String,
    default: ''
  },
  // 其它服装
  other_clothing: {
    type: String,
    default: ''
  },
  // 描述
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
modelPersonSchema.index({ user_id: 1, status: 1 });
modelPersonSchema.index({ gender: 1, age_stage: 1, body_feature: 1 });

// 更新时间戳
modelPersonSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('ModelPerson', modelPersonSchema);
