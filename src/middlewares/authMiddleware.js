// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const User = require('../models/user/userModel');

// 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token（兼容多种方式）
    const authHeader = req.headers.authorization || 
                       req.headers.Authorization || 
                       req.get('Authorization') ||
                       req.header('Authorization');
    
    if (!authHeader) {
      console.error('认证失败: 未提供Authorization头', {
        headers: Object.keys(req.headers),
        url: req.url,
        method: req.method
      });
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，访问被拒绝'
      });
    }

    // 提取token（格式：Bearer token）
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    
    if (!token || token === authHeader) {
      console.error('认证失败: Token格式错误', {
        authHeader: authHeader ? '已提供' : '未提供',
        tokenLength: token ? token.length : 0
      });
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误，请使用格式: Bearer <token>'
      });
    }

    // 验证token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      console.error('JWT验证失败:', {
        error: jwtError.name,
        message: jwtError.message,
        tokenLength: token.length
      });
      throw jwtError; // 让下面的catch处理
    }
    
    if (!decoded || !decoded.userId) {
      console.error('JWT解码失败: 缺少userId', { decoded });
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    
    // 查找用户并验证token是否匹配
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.error('用户不存在:', { userId: decoded.userId });
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证token是否与数据库中的token匹配（用于登出后使token失效）
    if (user.token !== token) {
      console.error('Token不匹配:', {
        userId: user._id,
        dbTokenExists: !!user.token,
        dbTokenLength: user.token ? user.token.length : 0,
        requestTokenLength: token.length
      });
      return res.status(401).json({
        success: false,
        message: '认证令牌已失效，请重新登录'
      });
    }

    // 将用户信息附加到请求对象
    req.user = {
      userId: user._id,
      openid: user.openid,
      email: user.email,
      name: user.name || user.wxName
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('认证中间件错误:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌: ' + error.message
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期，请重新登录'
      });
    }

    return res.status(500).json({
      success: false,
      message: '服务器错误: ' + (error.message || '未知错误')
    });
  }
};

module.exports = authMiddleware;

