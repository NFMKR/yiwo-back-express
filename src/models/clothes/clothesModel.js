// src/models/clothes/clothesModel.js

const mongoose = require('mongoose');

const clothesSchema = new mongoose.Schema({
  clothesId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shopId: {
    type: String,
    required: true,
    ref: 'Shop',
    index: true
  },
  shopName: {
    type: String,
    default: '',
    trim: true
  },
  clothesName: {
    type: String,
    default: '未命名衣服',
    trim: true
  },
  positionType: {
    type: String,
    required: true,
    enum: ['上装', '下装', '头饰/帽', '外套', '裤子', '裙子', '包袋', '鞋', '其他'],
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['上架', '下架', '售罄'],
    default: '上架',
    index: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  shop_qr_image_url: {
    type: String,
    default: ''
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

// 复合索引：店铺ID + 状态，用于快速查询店铺的上架商品
clothesSchema.index({ shopId: 1, status: 1 });

// 更新时间戳
clothesSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Clothes', clothesSchema);

