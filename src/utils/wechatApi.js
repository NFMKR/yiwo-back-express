// src/utils/wechatApi.js
// 微信小程序API工具函数

const axios = require('axios');
const https = require('https');
const { wechatAppId, wechatAppSecret, wechatApiUrl } = require('../config');

// 创建专门用于微信API的axios实例，跳过SSL证书校验
// 仅针对微信API（api.weixin.qq.com）跳过证书校验，其他业务服务正常校验
const wechatAxiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // 仅对微信API跳过证书校验
    keepAlive: true
  }),
  timeout: 10000 // 10秒超时
});

// 导出微信专用axios实例，供其他模块使用（如wechatCloudStorageService）
exports.wechatAxiosInstance = wechatAxiosInstance;

/**
 * 通过code获取微信openid和session_key
 * @param {string} code - 微信小程序wx.login()返回的code
 * @returns {Promise<Object>} - {openid, session_key, unionid(如果有)}
 */
exports.getWeChatOpenId = async (code) => {
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

  try {
    // 使用微信专用axios实例（已配置跳过SSL证书校验）
    const response = await wechatAxiosInstance.get(url, { params });

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
    throw new Error(`微信API请求失败: ${error.message}`);
  }
};

/**
 * 获取微信用户信息（需要用户授权）
 * @param {string} accessToken - 访问令牌
 * @param {string} openid - 用户openid
 * @returns {Promise<Object>} - 用户信息
 */
exports.getWeChatUserInfo = async (accessToken, openid) => {
  const url = `${wechatApiUrl}/sns/userinfo`;
  const params = {
    access_token: accessToken,
    openid: openid,
    lang: 'zh_CN'
  };

  try {
    // 使用微信专用axios实例（已配置跳过SSL证书校验）
    const response = await wechatAxiosInstance.get(url, { params });

    if (response.data.errcode) {
      throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`获取微信用户信息失败: ${error.response.data?.errmsg || error.message}`);
    }
    throw new Error(`获取微信用户信息失败: ${error.message}`);
  }
};

