// src/services/userBindingService.js

const UserBinding = require('../models/userBindingModel');
const Shop = require('../models/shop/shopModel');
const Clothes = require('../models/clothes/clothesModel');

// 获取或创建用户绑定记录
const getOrCreateUserBinding = async (userId) => {
  let binding = await UserBinding.findOne({ userId });
  
  if (!binding) {
    binding = new UserBinding({
      userId,
      boundShops: [],
      favoriteClothes: [],
      generatedRecords: []
    });
    await binding.save();
  }
  
  return binding;
};

// 绑定店铺
exports.bindShop = async (userId, shopId) => {
  try {
    // 检查店铺是否存在
    const shop = await Shop.findOne({ shopId });
    if (!shop) {
      throw new Error('店铺不存在');
    }

    // 获取或创建用户绑定记录
    const binding = await getOrCreateUserBinding(userId);

    // 检查是否已绑定
    if (binding.boundShops.includes(shopId)) {
      throw new Error('该店铺已绑定');
    }

    // 添加店铺到绑定列表
    binding.boundShops.push(shopId);
    await binding.save();

    return {
      message: '绑定店铺成功',
      shopId,
      shopName: shop.shopName
    };
  } catch (error) {
    throw error;
  }
};

// 取消绑定店铺
exports.unbindShop = async (userId, shopId) => {
  try {
    const binding = await UserBinding.findOne({ userId });
    
    if (!binding) {
      throw new Error('未找到用户绑定记录');
    }

    // 检查是否绑定了该店铺
    if (!binding.boundShops.includes(shopId)) {
      throw new Error('未绑定该店铺');
    }

    // 从绑定列表中移除店铺
    binding.boundShops = binding.boundShops.filter(id => id !== shopId);
    await binding.save();

    return {
      message: '取消绑定成功',
      shopId
    };
  } catch (error) {
    throw error;
  }
};

// 获取用户所有绑定的店铺
exports.getBoundShops = async (userId) => {
  try {
    const binding = await getOrCreateUserBinding(userId);

    // 获取所有绑定店铺的详细信息
    const shops = await Shop.find({ 
      shopId: { $in: binding.boundShops } 
    }).select('shopId shopName avatarUrl');

    return {
      total: shops.length,
      shops: shops.map(shop => ({
        shopId: shop.shopId,
        shopName: shop.shopName,
        avatarUrl: shop.avatarUrl
      }))
    };
  } catch (error) {
    throw error;
  }
};

// 添加收藏衣服
exports.addFavoriteClothes = async (userId, clothesId) => {
  try {
    // 检查衣服是否存在
    const clothes = await Clothes.findOne({ clothesId });
    if (!clothes) {
      throw new Error('衣服不存在');
    }

    // 获取或创建用户绑定记录
    const binding = await getOrCreateUserBinding(userId);

    // 检查是否已收藏
    if (binding.favoriteClothes.includes(clothesId)) {
      throw new Error('该衣服已收藏');
    }

    // 添加到收藏列表
    binding.favoriteClothes.push(clothesId);
    await binding.save();

    return {
      message: '收藏成功',
      clothesId,
      clothesName: clothes.clothesName
    };
  } catch (error) {
    throw error;
  }
};

// 取消收藏衣服
exports.removeFavoriteClothes = async (userId, clothesId) => {
  try {
    const binding = await UserBinding.findOne({ userId });
    
    if (!binding) {
      throw new Error('未找到用户绑定记录');
    }

    // 检查是否收藏了该衣服
    if (!binding.favoriteClothes.includes(clothesId)) {
      throw new Error('未收藏该衣服');
    }

    // 从收藏列表中移除
    binding.favoriteClothes = binding.favoriteClothes.filter(id => id !== clothesId);
    await binding.save();

    return {
      message: '取消收藏成功',
      clothesId
    };
  } catch (error) {
    throw error;
  }
};

// 获取用户所有收藏的衣服
exports.getFavoriteClothes = async (userId) => {
  try {
    const binding = await getOrCreateUserBinding(userId);

    // 获取所有收藏衣服的详细信息
    const clothesList = await Clothes.find({ 
      clothesId: { $in: binding.favoriteClothes } 
    }).select('-__v');

    return {
      total: clothesList.length,
      clothes: clothesList
    };
  } catch (error) {
    throw error;
  }
};

