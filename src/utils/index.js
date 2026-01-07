// src/utils/index.js
// 通用工具函数

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期字符串
 */
exports.formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} - 是否有效
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证URL格式
 * @param {string} url - URL地址
 * @returns {boolean} - 是否有效
 */
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

/**
 * 延迟函数（用于轮询等场景）
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} - Promise对象
 */
exports.delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} - 随机字符串
 */
exports.generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 从错误对象中提取消息
 * @param {Error} error - 错误对象
 * @returns {string} - 错误消息
 */
exports.getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || error.response.data?.error || error.message;
  }
  return error.message || '未知错误';
};

