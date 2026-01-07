// src/models/shop/shopModel.js

const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  avatarUrl: {
    type: String,
    required: true
  },
  qrcodeUrl: {
    type: String,
    required: true
  },
  memberLevel: {
    type: String,
    required: true,
    enum: ['普通会员', 'VIP会员', '黄金会员', '钻石会员'],
    default: '普通会员'
  },
  wechatId: {
    type: String,
    required: true,
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

// 更新时间戳
shopSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Shop', shopSchema);

