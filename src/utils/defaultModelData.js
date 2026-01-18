// src/utils/defaultModelData.js
// 生成默认模特数据

/**
 * 生成默认模特数据（用于自动创建模特）
 * @returns {Object} 默认模特数据
 */
exports.generateDefaultModelData = () => {
  // 固定的默认头像URL（用于current_avatar_url，但不添加到avatar_images数组）
  const defaultAvatarUrl = 'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/personavatar3.png';
  // 固定的默认试穿效果图URL
  const defaultTryonImageUrl = 'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/person3.png';

  return {
    model_name: '我的模特',
    // avatar_images留空，让用户自己上传头像
    gender: '女', // 固定为女性
    age_stage: '2008年1月15日',
    height: 165, // 默认身高165cm
    weight: 50, // 默认体重50kg
    body_feature: '标准',
    suitable_weather: '四季',
    shooting_style: '时尚',
    mood: '开心',
    style_preference: '简约',
    top_garment: '',
    top_garment_id: '',
    bottom_garment: '',
    bottom_garment_id: '',
    headwear: '',
    headwear_id: '',
    accessories: '',
    accessories_id: '',
    outerwear: '',
    outerwear_id: '',
    bag: '',
    bag_id: '',
    shoes: '',
    shoes_id: '',
    other_clothing: '',
    other_clothing_id: '',
    description: '',
    current_avatar_url: defaultAvatarUrl, // 当前头像URL，使用默认头像（不添加到avatar_images数组）
    current_tryon_image_url: defaultTryonImageUrl // 当前试穿效果图URL
  };
};

