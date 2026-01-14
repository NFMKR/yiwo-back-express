// src/services/userService.js

const User = require('../models/user/userModel');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { getWeChatOpenId } = require('../utils/wechatApi');
const { generateRandomNickname, getRandomDefaultAvatar } = require('../utils/nicknameGenerator');
const { generateDefaultModelData } = require('../utils/defaultModelData');
const modelPersonService = require('./modelPersonService');

// 微信小程序登录/注册（一键登录）
exports.wechatLogin = async (code, userInfo = {}) => {
  try {
    if (!code) {
      throw new Error('微信code不能为空');
    }

    // 通过code获取openid
    const wechatData = await getWeChatOpenId(code);
    const { openid, session_key, unionid } = wechatData;

    if (!openid) {
      throw new Error('获取微信openid失败');
    }

    // 查找用户（通过openid）
    let user = await User.findOne({ openid });
    let isNewUser = false;

    if (!user) {
      // 新用户，自动注册
      isNewUser = true;
      
      // 生成随机昵称（如果用户没有提供name或nickName）
      const generatedName = userInfo.name || userInfo.nickName || generateRandomNickname();
      
      // 获取微信头像（如果用户提供了）
      const wxAvatar = userInfo.avatarUrl || userInfo.wxAvatarUrl || '';
      
      // 随机选择默认头像（如果用户没有提供微信头像，使用随机默认头像）
      const finalAvatarUrl = wxAvatar || getRandomDefaultAvatar();
      
      user = new User({
        openid,
        wxName: userInfo.nickName || userInfo.wxName || '',
        wxAvatarUrl: wxAvatar, // 微信头像（如果有，否则为空）
        name: generatedName, // 使用生成的随机昵称或用户提供的昵称
        avatarUrl: finalAvatarUrl, // 优先使用微信头像，否则使用随机默认头像
        registeredShops: []
      });
    } else {
      // 老用户，更新微信信息
      if (userInfo.nickName || userInfo.wxName) {
        user.wxName = userInfo.nickName || userInfo.wxName;
      }
      if (userInfo.avatarUrl || userInfo.wxAvatarUrl) {
        user.wxAvatarUrl = userInfo.avatarUrl || userInfo.wxAvatarUrl;
      }
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, openid: user.openid },
      jwtSecret,
      { expiresIn: '30d' } // 微信登录token有效期30天
    );

    // 保存token
    user.token = token;
    user.updatedAt = Date.now();
    await user.save();

    // 如果是新用户，自动创建默认模特
    if (isNewUser) {
      try {
        // 检查是否已有模特（防止重复创建）
        const ModelPerson = require('../models/model/modelPersonModel');
        const existingModel = await ModelPerson.findOne({ user_id: user._id });
        
        if (!existingModel) {
          console.log('新用户注册，自动创建默认模特...');
          const defaultModelData = generateDefaultModelData();
          await modelPersonService.createOrUpdateUserModel(user._id, defaultModelData);
          console.log('自动创建默认模特成功');
        }
      } catch (modelError) {
        // 创建模特失败不影响用户注册，只记录错误
        console.error('自动创建默认模特失败:', modelError.message);
      }
    }

    return {
      user: {
        id: user._id,
        openid: user.openid,
        name: user.name || user.wxName,
        wxName: user.wxName,
        email: user.email,
        userphone: user.userphone,
        shopPhone: user.shopPhone,
        avatarUrl: user.avatarUrl || user.wxAvatarUrl,
        wxAvatarUrl: user.wxAvatarUrl,
        qrcodeUrl: user.qrcodeUrl,
        registeredShops: user.registeredShops,
        createdAt: user.createdAt
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
      name: user.name || user.wxName,
      wxName: user.wxName,
      email: user.email,
      userphone: user.userphone,
      shopPhone: user.shopPhone,
      openid: user.openid,
      avatarUrl: user.avatarUrl || user.wxAvatarUrl,
      wxAvatarUrl: user.wxAvatarUrl,
      qrcodeUrl: user.qrcodeUrl,
      registeredShops: user.registeredShops,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    throw error;
  }
};

// 更新用户信息
exports.updateUserInfo = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 允许更新的字段
    const allowedFields = [
      'name', 'email', 'userphone', 'shopPhone', 
      'avatarUrl', 'qrcodeUrl', 'wxName', 'wxAvatarUrl'
    ];

    // 更新允许的字段
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    // 如果更新密码
    if (updateData.password) {
      user.password = updateData.password; // 会在pre('save')中自动加密
    }

    user.updatedAt = Date.now();
    await user.save();

    return {
      id: user._id,
      name: user.name || user.wxName,
      wxName: user.wxName,
      email: user.email,
      userphone: user.userphone,
      shopPhone: user.shopPhone,
      avatarUrl: user.avatarUrl || user.wxAvatarUrl,
      wxAvatarUrl: user.wxAvatarUrl,
      qrcodeUrl: user.qrcodeUrl,
      registeredShops: user.registeredShops,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    throw error;
  }
};

// 注销账号
exports.deleteAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 删除用户
    await User.findByIdAndDelete(userId);

    return { message: '账号注销成功' };
  } catch (error) {
    throw error;
  }
};

// 添加注册店铺
exports.addRegisteredShop = async (userId, shopData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const { shopId, shopAvatarUrl, shopName, shopIdValue, memberLevel } = shopData;

    // 检查是否已注册该店铺
    const existingShop = user.registeredShops.find(
      shop => shop.shopId.toString() === shopId.toString()
    );

    if (existingShop) {
      throw new Error('该店铺已注册');
    }

    // 添加店铺
    user.registeredShops.push({
      shopId,
      shopAvatarUrl: shopAvatarUrl || '',
      shopName: shopName || '',
      shopIdValue: shopIdValue || '',
      memberLevel: memberLevel || '普通会员'
    });

    user.updatedAt = Date.now();
    await user.save();

    return {
      message: '店铺注册成功',
      registeredShops: user.registeredShops
    };
  } catch (error) {
    throw error;
  }
};

// 获取所有用户（可选，用于测试）
exports.getAllUsers = async () => {
  try {
    const users = await User.find().select('-password -token -openid');
    return users;
  } catch (error) {
    throw error;
  }
};
