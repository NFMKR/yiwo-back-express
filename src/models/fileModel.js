// src/models/fileModel.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  // 绑定用户
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 文件ID（微信云存储返回的fileID）
  file_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // 云存储路径
  cloud_path: {
    type: String,
    required: true,
    trim: true
  },
  // 文件URL（公网可访问的URL）
  file_url: {
    type: String,
    required: true
  },
  // 文件类型
  file_type: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    default: 'image',
    index: true
  },
  // 文件大小（字节）
  file_size: {
    type: Number,
    default: 0
  },
  // 文件用途/分类
  category: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  // 文件描述
  description: {
    type: String,
    default: '',
    trim: true
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

// 复合索引
fileSchema.index({ user_id: 1, category: 1 });
fileSchema.index({ user_id: 1, file_type: 1 });

// 更新时间戳
fileSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('File', fileSchema);

