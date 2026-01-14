// src/utils/defaultModelData.js
// 生成默认模特数据

const { getRandomDefaultAvatar } = require('./nicknameGenerator');

/**
 * 生成默认模特数据（用于自动创建模特）
 * @returns {Object} 默认模特数据
 */
exports.generateDefaultModelData = () => {
  // 使用随机默认头像作为全身图
  const defaultFullBodyImageUrl = getRandomDefaultAvatar();

  return {
    model_name: '我的模特',
    full_body_image_url: defaultFullBodyImageUrl,
    gender: '女', // 默认女性（符合服装试穿场景）
    age_stage: '青年',
    height: 165, // 默认身高165cm
    weight: 50, // 默认体重50kg
    body_feature: '标准',
    suitable_weather: '四季',
    shooting_style: '时尚',
    mood: '开心',
    style_preference: '简约',
    top_garment: '',
    bottom_garment: '',
    headwear: '',
    accessories: '',
    outerwear: '',
    bag: '',
    shoes: '',
    other_clothing: '',
    description: ''
  };
};

