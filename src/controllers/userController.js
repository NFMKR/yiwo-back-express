// src/controllers/userController.js

const userService = require('../services/userService');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 验证必填字段
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: '请提供完整的注册信息（姓名、邮箱、密码）' 
      });
    }

    const result = await userService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '注册失败'
    });
  }
};

// 用户登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: '请提供邮箱和密码' 
      });
    }

    const result = await userService.login(email, password);

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || '登录失败'
    });
  }
};

// 用户退出
exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await userService.logout(userId);

    res.status(200).json({
      success: true,
      message: '退出成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '退出失败'
    });
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const userInfo = await userService.getUserInfo(userId);

    res.status(200).json({
      success: true,
      message: '获取用户信息成功',
      data: userInfo
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || '获取用户信息失败'
    });
  }
};

// 获取所有用户（可选，用于测试）
exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
      success: true,
      message: '获取用户列表成功',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '获取用户列表失败'
    });
  }
};
