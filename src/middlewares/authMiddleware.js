// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const User = require('../models/user/userModel');

// 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，访问被拒绝'
      });
    }

    // 提取token（格式：Bearer token）
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, jwtSecret);
    
    // 查找用户并验证token是否匹配
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证token是否与数据库中的token匹配（用于登出后使token失效）
    if (user.token !== token) {
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
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
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
      message: '服务器错误'
    });
  }
};

module.exports = authMiddleware;

