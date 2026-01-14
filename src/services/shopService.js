// src/services/shopService.js

const Shop = require('../models/shop/shopModel');
const User = require('../models/user/userModel');
const { generateUniqueShopId } = require('../utils/shopIdGenerator');
const qrcodeService = require('./qrcodeService');

// 创建商家店铺
exports.createShop = async (userId, shopData) => {
  try {
    const { 
      shopId, 
      shopName, 
      avatarUrl, 
      qrcodeUrl, 
      background_image_url,
      memberLevel, 
      wechatId 
    } = shopData;

    // 如果没有提供shopId，自动生成一个6位不重复的ID
    let finalShopId = shopId;
    if (!finalShopId) {
      finalShopId = await generateUniqueShopId();
    } else {
      // 如果提供了shopId，检查是否已存在
      const existingShop = await Shop.findOne({ shopId: finalShopId });
      if (existingShop) {
        throw new Error('店铺ID已存在');
      }
    }

    // 所有字段都是可选的，提供默认值
    // 创建新店铺
    const shop = new Shop({
      user_id: userId,
      shopId: finalShopId, // 使用自动生成或用户提供的shopId
      shopName: shopName || '未命名店铺',
      avatarUrl: avatarUrl || '',
      qrcodeUrl: qrcodeUrl || '',
      background_image_url: background_image_url || '',
      memberLevel: memberLevel || '普通会员',
      wechatId: wechatId || ''
    });

    await shop.save();

    // 同步更新用户模型的registeredShops数组
    const user = await User.findById(userId);
    if (user) {
      // 检查是否已存在该店铺
      const shopExists = user.registeredShops.some(
        rs => rs.shopId.toString() === shop._id.toString()
      );

      if (!shopExists) {
        user.registeredShops.push({
          shopId: shop._id,
          shopAvatarUrl: shop.avatarUrl,
          shopName: shop.shopName,
          shopIdValue: shop.shopId,
          memberLevel: shop.memberLevel
        });
        await user.save();
      }
    }

    return {
      shop: {
        id: shop._id,
        user_id: shop.user_id,
        shopId: shop.shopId,
        shopName: shop.shopName,
        avatarUrl: shop.avatarUrl,
        qrcodeUrl: shop.qrcodeUrl,
        background_image_url: shop.background_image_url,
        memberLevel: shop.memberLevel,
        wechatId: shop.wechatId,
        createdAt: shop.createdAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 更新店铺信息
exports.updateShop = async (userId, shopIdOrShopIdValue, updateData) => {
  try {
    // 支持MongoDB _id或shopId字符串
    let shop;
    if (shopIdOrShopIdValue.match(/^[0-9a-fA-F]{24}$/)) {
      // 是MongoDB ObjectId
      shop = await Shop.findOne({ _id: shopIdOrShopIdValue, user_id: userId });
    } else {
      // 是shopId字符串
      shop = await Shop.findOne({ shopId: shopIdOrShopIdValue, user_id: userId });
    }
    
    if (!shop) {
      throw new Error('店铺不存在或无权限修改');
    }

    // 允许更新的字段
    const allowedFields = [
      'shopName', 'avatarUrl', 'qrcodeUrl', 'background_image_url',
      'memberLevel', 'wechatId'
    ];

    // 更新字段
    let hasChanges = false;
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        shop[field] = updateData[field];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      throw new Error('没有需要更新的字段');
    }

    // 如果更新了shopId，需要检查新ID是否已存在
    if (updateData.shopId && updateData.shopId !== shop.shopId) {
      const existingShop = await Shop.findOne({ shopId: updateData.shopId });
      if (existingShop) {
        throw new Error('新的店铺ID已存在');
      }
      shop.shopId = updateData.shopId;
    }

    shop.updatedAt = Date.now();
    await shop.save();

    // 同步更新用户模型的registeredShops数组
    const user = await User.findById(userId);
    if (user) {
      const shopIndex = user.registeredShops.findIndex(
        rs => rs.shopId.toString() === shop._id.toString()
      );

      if (shopIndex !== -1) {
        // 更新registeredShops中的信息
        user.registeredShops[shopIndex].shopAvatarUrl = shop.avatarUrl;
        user.registeredShops[shopIndex].shopName = shop.shopName;
        user.registeredShops[shopIndex].shopIdValue = shop.shopId;
        user.registeredShops[shopIndex].memberLevel = shop.memberLevel;
        await user.save();
      }
    }

    return {
      shop: {
        id: shop._id,
        user_id: shop.user_id,
        shopId: shop.shopId,
        shopName: shop.shopName,
        avatarUrl: shop.avatarUrl,
        qrcodeUrl: shop.qrcodeUrl,
        background_image_url: shop.background_image_url,
        memberLevel: shop.memberLevel,
        wechatId: shop.wechatId,
        updatedAt: shop.updatedAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 获取用户全部店铺
exports.getUserShops = async (userId) => {
  try {
    const shops = await Shop.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    return {
      shops: shops.map(shop => ({
        id: shop._id,
        shopId: shop.shopId,
        shopName: shop.shopName,
        avatarUrl: shop.avatarUrl,
        qrcodeUrl: shop.qrcodeUrl,
        background_image_url: shop.background_image_url,
        memberLevel: shop.memberLevel,
        wechatId: shop.wechatId,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt
      })),
      total: shops.length
    };
  } catch (error) {
    throw error;
  }
};

// 删除店铺
exports.deleteShop = async (userId, shopId) => {
  try {
    // 查找店铺（确保是用户的店铺）
    const shop = await Shop.findOne({ _id: shopId, user_id: userId });
    if (!shop) {
      throw new Error('店铺不存在或无权限删除');
    }

    // 删除店铺
    await Shop.findByIdAndDelete(shopId);

    // 从用户模型的registeredShops数组中移除
    const user = await User.findById(userId);
    if (user) {
      user.registeredShops = user.registeredShops.filter(
        rs => rs.shopId.toString() !== shopId.toString()
      );
      await user.save();
    }

    return {
      message: '店铺删除成功',
      shopId: shop.shopId,
      shopName: shop.shopName
    };
  } catch (error) {
    throw error;
  }
};

// 获取指定店铺的全部信息
exports.getShopInfo = async (shopIdOrShopIdValue, userId = null) => {
  try {
    let shop;

    // 判断是MongoDB ObjectId还是shopId字符串
    if (shopIdOrShopIdValue.match(/^[0-9a-fA-F]{24}$/)) {
      // 是MongoDB ObjectId
      shop = await Shop.findById(shopIdOrShopIdValue);
    } else {
      // 是shopId字符串
      shop = await Shop.findOne({ shopId: shopIdOrShopIdValue });
    }

    if (!shop) {
      throw new Error('店铺不存在');
    }

    // 如果提供了userId，验证是否是店铺创建者（可选，用于权限控制）
    if (userId && shop.user_id.toString() !== userId.toString()) {
      // 可以选择返回错误或允许查看（根据业务需求）
      // 这里允许查看，但可以标记是否为创建者
    }

    return {
      shop: {
        id: shop._id,
        user_id: shop.user_id,
        shopId: shop.shopId,
        shopName: shop.shopName,
        avatarUrl: shop.avatarUrl,
        qrcodeUrl: shop.qrcodeUrl,
        background_image_url: shop.background_image_url,
        memberLevel: shop.memberLevel,
        wechatId: shop.wechatId,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
        isOwner: userId ? shop.user_id.toString() === userId.toString() : false
      }
    };
  } catch (error) {
    throw error;
  }
};

// 根据店铺ID获取店铺信息（用于其他模块）
exports.getShopById = async (shopId) => {
  try {
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new Error('店铺不存在');
    }
    return shop;
  } catch (error) {
    throw error;
  }
};
