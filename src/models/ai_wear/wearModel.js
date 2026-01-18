// src/models/ai_wear/wearModel.js  试穿记录生成

const mongoose = require('mongoose');

const wearSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: String,
    required: true,
    unique: true
  },
  // 输入参数
  personImageUrl: {
    type: String,
    required: true
  },
  // 试穿的衣服信息（数组，支持多件衣服）
  clothes: [{
    field: {
      type: String,
      default: '' // 字段名：top_garment, bottom_garment等
    },
    clothesId: {
      type: String,
      default: ''
    },
    clothesUrl: {
      type: String,
      default: ''
    },
    positionType: {
      type: String,
      default: ''
    },
    shopQrImageUrl: {
      type: String,
      default: ''
    }
  }],
  // 兼容旧数据：保留原有字段
  topGarmentUrl: {
    type: String,
    default: null
  },
  bottomGarmentUrl: {
    type: String,
    default: null
  },
  // 任务参数
  resolution: {
    type: Number,
    default: -1,
    enum: [-1, 1024, 1280]
  },
  restoreFace: {
    type: Boolean,
    default: true
  },
  // 任务状态
  taskStatus: {
    type: String,
    enum: ['PENDING', 'PRE-PROCESSING', 'RUNNING', 'POST-PROCESSING', 'SUCCEEDED', 'FAILED', 'UNKNOWN', 'CANCELED'],
    default: 'PENDING'
  },
  // 结果信息
  imageUrl: {
    type: String,
    default: null
  },
  submitTime: {
    type: String,
    default: null
  },
  scheduledTime: {
    type: String,
    default: null
  },
  endTime: {
    type: String,
    default: null
  },
  // 错误信息
  errorCode: {
    type: String,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  // 请求ID
  requestId: {
    type: String,
    default: null
  },
  // 使用的模型
  model: {
    type: String,
    default: null
  },
  // 提示词
  prompt: {
    type: String,
    default: null
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

// 更新时间戳
wearSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Wear', wearSchema);

