// src/utils/nicknameGenerator.js
// 随机昵称生成器（适用于女性服装试穿场景）

// 形容词词库（符合女性服装试穿风格）
const adjectives = [
  '优雅', '时尚', '甜美', '清新', '温柔', '精致', '浪漫', '简约',
  '复古', '潮流', '可爱', '知性', '文艺', '活力', '魅力', '优雅',
  '高级', '轻奢', '经典', '个性', '独特', '迷人', '气质', '优雅',
  '仙气', '梦幻', '清新', '自然', '舒适', '随性', '优雅', '大方'
];

// 名词词库（符合女性服装试穿场景）
const nouns = [
  '小仙女', '时尚达人', '穿搭师', '美衣控', '潮流女孩', '时尚博主',
  '衣橱女王', '搭配师', '时尚精', '美搭师', '衣品控', '潮流先锋',
  '时尚icon', '穿搭达人', '美衣达人', '时尚女孩', '搭配达人', '衣品师',
  '时尚控', '美搭控', '潮流控', '衣橱控', '时尚家', '搭配家', '美衣家'
];

/**
 * 生成随机昵称
 * 格式：随机形容词 + 随机名词 + 随机数字(1-999)
 * @returns {string} 随机生成的昵称
 */
exports.generateRandomNickname = () => {
  // 随机选择形容词
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  // 随机选择名词
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // 随机生成数字(1-999)
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  // 组合成昵称
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

/**
 * 随机选择默认头像URL
 * @returns {string} 随机选择的头像URL
 */
exports.getRandomDefaultAvatar = () => {
  const defaultAvatars = [
    'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/personavatar2.png',
    'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/personavatar3.png',
    'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/personavatar4.png'
  ];
  
  // 随机选择一个头像
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return defaultAvatars[randomIndex];
};

