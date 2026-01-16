// src/models/shop/shopModel.js

const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  // 绑定用户（用户创建店铺）
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  shopId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shopName: {
    type: String,
    default: '未命名店铺',
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  qrcodeUrl: {
    type: String,
    default: ''
  },
  // 店铺联系二维码URL
  contactQrcodeUrl: {
    type: String,
    default: ''
  },
  // 店铺背景图URL
  background_image_url: {
    type: String,
    default: ''
  },
  memberLevel: {
    type: String,
    enum: ['普通会员', 'VIP会员', '黄金会员', '钻石会员'],
    default: '普通会员'
  },
  wechatId: {
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

// 复合索引：用户ID + 店铺ID
shopSchema.index({ user_id: 1, shopId: 1 });

// 更新时间戳
shopSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Shop', shopSchema);
