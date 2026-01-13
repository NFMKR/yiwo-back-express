// src/config/index.js
const mongoose = require('mongoose');

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY,
  dashscopeApiUrl: process.env.DASHSCOPE_API_URL || 'https://dashscope.aliyuncs.com/api/v1',
  // 微信小程序配置
  wechatAppId: process.env.WECHAT_APPID,
  wechatAppSecret: process.env.WECHAT_APPSECRET,
  wechatApiUrl: 'https://api.weixin.qq.com'
};

