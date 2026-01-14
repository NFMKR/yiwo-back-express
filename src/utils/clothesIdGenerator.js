// src/utils/clothesIdGenerator.js
// 生成衣服ID工具函数

const Clothes = require('../models/clothes/clothesModel');

/**
 * 生成6位随机数字
 * @returns {string} 6位数字字符串
 */
const generateRandomNumber = () => {
  // 生成100000-999999之间的随机数
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * 生成不重复的衣服ID
 * 格式：shopId-6位随机数字
 * @param {string} shopId - 店铺ID
 * @param {number} maxAttempts - 最大尝试次数，默认100
 * @returns {Promise<string>} 不重复的衣服ID
 */
exports.generateUniqueClothesId = async (shopId, maxAttempts = 100) => {
  if (!shopId) {
    throw new Error('店铺ID不能为空');
  }

  for (let i = 0; i < maxAttempts; i++) {
    const randomNumber = generateRandomNumber();
    const clothesId = `${shopId}-${randomNumber}`;
    
    // 检查是否已存在
    const existingClothes = await Clothes.findOne({ clothesId });
    
    if (!existingClothes) {
      return clothesId;
    }
  }
  
  // 如果100次尝试都失败，抛出错误
  throw new Error('无法生成唯一的衣服ID，请稍后重试');
};

