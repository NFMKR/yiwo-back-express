// src/services/clothesService.js

const Clothes = require('../models/clothes/clothesModel');
const Shop = require('../models/shop/shopModel');

// 创建衣服
exports.createClothes = async (clothesData) => {
  try {
    const {
      clothesId,
      shopId,
      clothesName,
      positionType,
      imageUrl,
      price,
      status,
      description
    } = clothesData;

    // 检查店铺是否存在
    const shop = await Shop.findOne({ shopId });
    if (!shop) {
      throw new Error('店铺不存在');
    }

    // 检查衣服ID是否已存在
    const existingClothes = await Clothes.findOne({ clothesId });
    if (existingClothes) {
      throw new Error('衣服ID已存在');
    }

    // 创建新衣服
    const clothes = new Clothes({
      clothesId,
      shopId,
      shopName: shop.shopName, // 从店铺信息中获取店铺名
      clothesName,
      positionType,
      imageUrl,
      price,
      status: status || '上架',
      description: description || ''
    });

    await clothes.save();

    return {
      clothes: {
        id: clothes._id,
        clothesId: clothes.clothesId,
        shopId: clothes.shopId,
        shopName: clothes.shopName,
        clothesName: clothes.clothesName,
        positionType: clothes.positionType,
        imageUrl: clothes.imageUrl,
        price: clothes.price,
        status: clothes.status,
        description: clothes.description,
        createdAt: clothes.createdAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 获取指定店铺的所有衣服
exports.getClothesByShopId = async (shopId, options = {}) => {
  try {
    const { page = 1, limit = 20, status, positionType } = options;

    // 检查店铺是否存在
    const shop = await Shop.findOne({ shopId });
    if (!shop) {
      throw new Error('店铺不存在');
    }

    // 构建查询条件
    const query = { shopId };
    
    // 可选筛选条件
    if (status) {
      query.status = status;
    }
    if (positionType) {
      query.positionType = positionType;
    }

    // 查询衣服列表
    const clothesList = await Clothes.find(query)
      .sort({ createdAt: -1 }) // 按创建时间倒序
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    const total = await Clothes.countDocuments(query);

    return {
      shopInfo: {
        shopId: shop.shopId,
        shopName: shop.shopName
      },
      clothes: clothesList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

