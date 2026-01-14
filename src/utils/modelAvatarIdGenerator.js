// src/utils/modelAvatarIdGenerator.js
// 生成唯一的6位数字模特头像ID

const ModelPerson = require('../models/model/modelPersonModel');

/**
 * 生成唯一的6位数字模特头像ID
 * @returns {Promise<string>} 唯一的6位数字ID
 */
exports.generateUniqueModelAvatarId = async (maxAttempts = 100) => {
  for (let i = 0; i < maxAttempts; i++) {
    // 生成6位随机数字（100000-999999）
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const generatedId = randomDigits.toString();

    // 检查该ID是否已存在于任何模特的头像数组中
    const existingModel = await ModelPerson.findOne({
      'avatar_images.model_avatar_id': generatedId
    });

    if (!existingModel) {
      return generatedId;
    }
  }

  throw new Error('无法生成唯一的模特头像ID，请稍后再试');
};

