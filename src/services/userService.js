// src/services/userService.js

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

// 用户注册
exports.register = async (userData) => {
  try {
    const { name, email, password } = userData;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 创建新用户
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // 生成token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 保存token到用户记录
    user.token = token;
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

// 用户登录
exports.login = async (email, password) => {
  try {
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 生成新的token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // 更新token
    user.token = token;
    user.updatedAt = Date.now();
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

// 用户退出
exports.logout = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 清除token
    user.token = null;
    user.updatedAt = Date.now();
    await user.save();

    return { message: '退出成功' };
  } catch (error) {
    throw error;
  }
};

// 获取用户信息
exports.getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -token');
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    throw error;
  }
};

// 获取所有用户（可选）
exports.getAllUsers = async () => {
  try {
    const users = await User.find().select('-password -token');
    return users;
  } catch (error) {
    throw error;
  }
};

