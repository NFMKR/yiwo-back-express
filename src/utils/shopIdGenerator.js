// src/utils/shopIdGenerator.js
// 生成6位不重复的店铺ID

const Shop = require('../models/shop/shopModel');

/**
 * 生成6位数字的店铺ID
 * @returns {string} 6位数字字符串
 */
const generateShopId = () => {
  // 生成100000-999999之间的随机数
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * 生成不重复的6位店铺ID
 * @param {number} maxAttempts - 最大尝试次数，默认100
 * @returns {Promise<string>} 不重复的6位店铺ID
 */
exports.generateUniqueShopId = async (maxAttempts = 100) => {
  for (let i = 0; i < maxAttempts; i++) {
    const shopId = generateShopId();
    
    // 检查是否已存在
    const existingShop = await Shop.findOne({ shopId });
    
    if (!existingShop) {
      return shopId;
    }
  }
  
  // 如果100次尝试都失败，抛出错误
  throw new Error('无法生成唯一的店铺ID，请稍后重试');
};

