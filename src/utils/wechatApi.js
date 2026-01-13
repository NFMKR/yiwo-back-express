// src/utils/wechatApi.js
// 微信小程序API工具函数

const axios = require('axios');
const { wechatAppId, wechatAppSecret, wechatApiUrl } = require('../config');

/**
 * 通过code获取微信openid和session_key
 * @param {string} code - 微信小程序wx.login()返回的code
 * @returns {Promise<Object>} - {openid, session_key, unionid(如果有)}
 */
exports.getWeChatOpenId = async (code) => {
  try {
    if (!wechatAppId || !wechatAppSecret) {
      throw new Error('微信AppID或AppSecret未配置');
    }

    const url = `${wechatApiUrl}/sns/jscode2session`;
    const params = {
      appid: wechatAppId,
      secret: wechatAppSecret,
      js_code: code,
      grant_type: 'authorization_code'
    };

    const response = await axios.get(url, { params });

    if (response.data.errcode) {
      throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    return {
      openid: response.data.openid,
      session_key: response.data.session_key,
      unionid: response.data.unionid || null
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`微信API请求失败: ${error.response.data?.errmsg || error.message}`);
    }
    throw error;
  }
};

/**
 * 获取微信用户信息（需要用户授权）
 * @param {string} accessToken - 访问令牌
 * @param {string} openid - 用户openid
 * @returns {Promise<Object>} - 用户信息
 */
exports.getWeChatUserInfo = async (accessToken, openid) => {
  try {
    const url = `${wechatApiUrl}/sns/userinfo`;
    const params = {
      access_token: accessToken,
      openid: openid,
      lang: 'zh_CN'
    };

    const response = await axios.get(url, { params });

    if (response.data.errcode) {
      throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`获取微信用户信息失败: ${error.response.data?.errmsg || error.message}`);
    }
    throw error;
  }
};

