// src/utils/defaultModelData.js
// 生成默认模特数据

/**
 * 生成默认模特数据（用于自动创建模特）
 * @returns {Object} 默认模特数据
 */
exports.generateDefaultModelData = () => {
  // 固定的默认头像URL
  const defaultAvatarUrl = 'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/personavatar2.png';
  const defaultTryonImageUrl = 'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/person2.png';

  return {
    model_name: '我的模特',
    full_body_image_url: defaultAvatarUrl, // 使用固定的默认头像作为全身图
    gender: '女', // 固定为女性
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
    description: '',
    current_avatar_url: defaultAvatarUrl, // 当前头像URL
    current_tryon_image_url: defaultTryonImageUrl // 当前试穿效果图URL
  };
};

