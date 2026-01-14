// src/services/clothesService.js

const Clothes = require('../models/clothes/clothesModel');
const Shop = require('../models/shop/shopModel');
const { generateUniqueClothesId } = require('../utils/clothesIdGenerator');

// 创建衣服
exports.createClothes = async (clothesData) => {
  try {
    const {
      shopId,
      positionType,
      imageUrl,
      clothesName,
      price,
      status,
      description,
      shop_qr_image_url
    } = clothesData;

    // 验证必填字段
    if (!shopId || !positionType || !imageUrl) {
      throw new Error('请提供店铺ID、部位类型和图片URL');
    }

    // 检查店铺是否存在
    const shop = await Shop.findOne({ shopId });
    if (!shop) {
      throw new Error('店铺不存在');
    }

    // 如果没有提供clothesId，自动生成一个（格式：shopId-6位随机数字）
    let finalClothesId = clothesData.clothesId;
    if (!finalClothesId) {
      finalClothesId = await generateUniqueClothesId(shopId);
    } else {
      // 如果提供了clothesId，检查是否已存在
      const existingClothes = await Clothes.findOne({ clothesId: finalClothesId });
      if (existingClothes) {
        throw new Error('衣服ID已存在');
      }
    }

    // 创建新衣服（所有字段都有默认值）
    const clothes = new Clothes({
      clothesId: finalClothesId,
      shopId,
      shopName: shop.shopName, // 从店铺信息中获取店铺名
      clothesName: clothesName || '未命名衣服',
      positionType,
      imageUrl,
      price: price !== undefined ? price : 0,
      status: status || '上架',
      description: description || '',
      shop_qr_image_url: shop_qr_image_url || ''
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
        shop_qr_image_url: clothes.shop_qr_image_url,
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

// 根据_id获取指定衣服详细信息
exports.getClothesById = async (clothesId) => {
  try {
    // 使用MongoDB的_id查找
    const clothes = await Clothes.findById(clothesId).select('-__v');
    
    if (!clothes) {
      throw new Error('衣服不存在');
    }

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
        shop_qr_image_url: clothes.shop_qr_image_url,
        createdAt: clothes.createdAt,
        updatedAt: clothes.updatedAt
      }
    };
  } catch (error) {
    // 处理MongoDB ObjectId格式错误
    if (error.name === 'CastError') {
      throw new Error('无效的衣服ID格式');
    }
    throw error;
  }
};

// 根据_id修改指定衣服信息（全部字段可修改）
exports.updateClothes = async (clothesId, updateData) => {
  try {
    // 查找衣服
    const clothes = await Clothes.findById(clothesId);
    
    if (!clothes) {
      throw new Error('衣服不存在');
    }

    // 如果更新了shopId，需要同步更新shopName
    if (updateData.shopId && updateData.shopId !== clothes.shopId) {
      const shop = await Shop.findOne({ shopId: updateData.shopId });
      if (!shop) {
        throw new Error('新店铺不存在');
      }
      clothes.shopId = updateData.shopId;
      clothes.shopName = shop.shopName;
    }

    // 更新所有可修改的字段
    const allowedFields = [
      'clothesId', 'clothesName', 'positionType', 'imageUrl', 
      'price', 'status', 'description', 'shop_qr_image_url'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        // 特殊处理价格验证
        if (field === 'price' && updateData[field] < 0) {
          throw new Error('价格不能为负数');
        }
        clothes[field] = updateData[field];
      }
    });

    // 保存更新
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
        shop_qr_image_url: clothes.shop_qr_image_url,
        createdAt: clothes.createdAt,
        updatedAt: clothes.updatedAt
      }
    };
  } catch (error) {
    // 处理MongoDB ObjectId格式错误
    if (error.name === 'CastError') {
      throw new Error('无效的衣服ID格式');
    }
    throw error;
  }
};

// 根据_id删除指定衣服
exports.deleteClothes = async (clothesId) => {
  try {
    // 查找衣服
    const clothes = await Clothes.findById(clothesId);
    
    if (!clothes) {
      throw new Error('衣服不存在');
    }

    // 保存删除前的信息用于返回
    const deletedClothes = {
      id: clothes._id,
      clothesId: clothes.clothesId,
      clothesName: clothes.clothesName
    };

    // 删除衣服
    await Clothes.findByIdAndDelete(clothesId);

    return {
      message: '衣服删除成功',
      clothes: deletedClothes
    };
  } catch (error) {
    // 处理MongoDB ObjectId格式错误
    if (error.name === 'CastError') {
      throw new Error('无效的衣服ID格式');
    }
    throw error;
  }
};

