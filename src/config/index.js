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
  wechatApiUrl: 'https://api.weixin.qq.com',
  // 微信云存储配置
  wechatCloudEnvId: process.env.VITE_WX_CLOUD_ENV_ID || process.env.WX_CLOUD_ENV_ID,
  wechatCloudAppId: process.env.WX_CLOUD_APPID,
  wechatCloudBucket: process.env.WX_CLOUD_BUCKET,
  // 腾讯云COS配置（用于后端上传）
  tencentSecretId: process.env.TENCENT_SECRET_ID,
  tencentSecretKey: process.env.TENCENT_SECRET_KEY,
  tencentRegion: process.env.TENCENT_REGION || 'ap-shanghai',
  tencentBucket: process.env.TENCENT_BUCKET,
  tencentCdnDomain: process.env.TENCENT_CDN_DOMAIN
};

