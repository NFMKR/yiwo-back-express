// src/models/userBindingModel.js

const mongoose = require('mongoose');

const userBindingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // 绑定的店铺ID数组
  boundShops: [{
    type: String,
    trim: true
  }],
  // 收藏的衣服ID数组
  favoriteClothes: [{
    type: String,
    trim: true
  }],
  // 生成记录的ID值组（用于追踪AI试穿记录等）
  generatedRecords: [{
    type: String,
    trim: true
  }],
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
userBindingSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('UserBinding', userBindingSchema);

