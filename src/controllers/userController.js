// src/controllers/userController.js

const userService = require('../services/userService');

// 微信小程序登录/注册（一键登录）
exports.wechatLogin = async (req, res) => {
  try {
    const { code, userInfo } = req.body;

    // 验证必填字段
    if (!code) {
      return res.status(400).json({
        success: false,
        message: '微信code不能为空'
      });
    }

    const result = await userService.wechatLogin(code, userInfo || {});

    res.status(200).json({
      success: true,
      message: result.user.id ? '登录成功' : '注册并登录成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '微信登录失败'
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

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const updateData = req.body;

    // 验证更新数据
    const allowedFields = [
      'name', 'email', 'userphone', 'shopPhone', 
      'avatarUrl', 'qrcodeUrl', 'wxName', 'wxAvatarUrl', 'password'
    ];

    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有有效的更新字段'
      });
    }

    const result = await userService.updateUserInfo(userId, filteredData);

    res.status(200).json({
      success: true,
      message: '更新用户信息成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '更新用户信息失败'
    });
  }
};

// 注销账号
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    const result = await userService.deleteAccount(userId);

    res.status(200).json({
      success: true,
      message: '账号注销成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '注销账号失败'
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
