// src/models/user/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用户注册店铺的子文档结构
const registeredShopSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  shopAvatarUrl: {
    type: String,
    default: ''
  },
  shopName: {
    type: String,
    default: ''
  },
  shopIdValue: {
    type: String,
    default: ''
  },
  memberLevel: {
    type: String,
    enum: ['普通会员', 'VIP会员', '黄金会员', '钻石会员'],
    default: '普通会员'
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    default: '',
    trim: true
  },
  email: { 
    type: String, 
    default: '',
    lowercase: true,
    trim: true
    // 不设置 unique，允许重复和空值
  },
  userphone: {
    type: String,
    default: '',
    trim: true
  },
  shopPhone: {
    type: String,
    default: '',
    trim: true
  },
  password: {
    type: String,
    default: null
  },
  token: {
    type: String,
    default: null
  },
  openid: {
    type: String,
    unique: true,
    sparse: true, // 允许null值，但如果有值则必须唯一
    trim: true,
    index: true
  },
  wxName: {
    type: String,
    default: '',
    trim: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  wxAvatarUrl: {
    type: String,
    default: ''
  },
  qrcodeUrl: {
    type: String,
    default: ''
  },
  registeredShops: {
    type: [registeredShopSchema],
    default: []
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

// 保存前处理
userSchema.pre('save', async function() {
  // 如果密码被修改且不为空，则加密
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // 更新时间戳
  this.updatedAt = Date.now();
});

// 比较密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password || !candidatePassword) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// 在模型初始化后，尝试删除 email 的唯一索引（如果存在）
// 这需要在数据库连接建立后执行
if (mongoose.connection.readyState === 1) {
  // 如果数据库已连接，立即尝试删除索引
  User.collection.dropIndex('email_1', function(err) {
    if (err && err.code !== 27) { // 27 表示索引不存在
      console.error('删除 email 唯一索引失败:', err);
    } else if (!err) {
      console.log('成功删除 email 唯一索引');
    }
  });
} else {
  // 如果数据库未连接，在连接后执行
  mongoose.connection.once('connected', function() {
    User.collection.dropIndex('email_1', function(err) {
      if (err && err.code !== 27) { // 27 表示索引不存在
        console.error('删除 email 唯一索引失败:', err);
      } else if (!err) {
        console.log('成功删除 email 唯一索引');
      }
    });
  });
}

module.exports = User;
