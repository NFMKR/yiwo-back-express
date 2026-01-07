// src/services/shopService.js

const Shop = require('../models/shop/shopModel');

// 创建商家店铺
exports.createShop = async (shopData) => {
  try {
    const { shopId, shopName, avatarUrl, qrcodeUrl, memberLevel, wechatId } = shopData;

    // 检查店铺ID是否已存在
    const existingShop = await Shop.findOne({ shopId });
    if (existingShop) {
      throw new Error('店铺ID已存在');
    }

    // 检查微信号是否已存在
    const existingWechat = await Shop.findOne({ wechatId });
    if (existingWechat) {
      throw new Error('该微信号已绑定其他店铺');
    }

    // 创建新店铺
    const shop = new Shop({
      shopId,
      shopName,
      avatarUrl,
      qrcodeUrl,
      memberLevel: memberLevel || '普通会员',
      wechatId
    });

    await shop.save();

    return {
      shop: {
        id: shop._id,
        shopId: shop.shopId,
        shopName: shop.shopName,
        avatarUrl: shop.avatarUrl,
        qrcodeUrl: shop.qrcodeUrl,
        memberLevel: shop.memberLevel,
        wechatId: shop.wechatId,
        createdAt: shop.createdAt
      }
    };
  } catch (error) {
    throw error;
  }
};

