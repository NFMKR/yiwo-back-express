// src/utils/wechatApi.js
// 微信小程序API工具函数

const axios = require('axios');
const https = require('https');
const { wechatAppId, wechatAppSecret, wechatApiUrl } = require('../config');

// 创建axios实例，配置SSL证书处理
// 对于微信API调用，允许自签名证书（某些网络环境可能需要）
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // 允许自签名证书，避免小程序体验版等环境的证书问题
    keepAlive: true
  }),
  timeout: 10000 // 10秒超时
});

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
    const response = await axiosInstance.get(url, { params });

    if (response.data.errcode) {
      throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    return {
      openid: response.data.openid,
      session_key: response.data.session_key,
      unionid: response.data.unionid || null
    };
  } catch (error) {
    // 处理SSL证书错误
    if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN' || 
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.message.includes('self-signed certificate') ||
        error.message.includes('certificate')) {
      console.warn('SSL证书验证警告:', error.message);
      // 如果遇到证书问题，尝试使用不验证证书的方式（仅用于开发环境）
      if (process.env.NODE_ENV !== 'production') {
        try {
          const insecureAgent = new https.Agent({
            rejectUnauthorized: false
          });
          const response = await axios.get(url, {
            params,
            httpsAgent: insecureAgent,
            timeout: 10000
          });
          
          if (response.data.errcode) {
            throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
          }
          
          return {
            openid: response.data.openid,
            session_key: response.data.session_key,
            unionid: response.data.unionid || null
          };
        } catch (retryError) {
          throw new Error(`微信API请求失败（SSL证书问题）: ${retryError.message}`);
        }
      } else {
        throw new Error('SSL证书验证失败，请联系管理员检查服务器证书配置');
      }
    }
    
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
    const response = await axiosInstance.get(url, { params });

    if (response.data.errcode) {
      throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
    }

    return response.data;
  } catch (error) {
    // 处理SSL证书错误
    if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN' || 
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.message.includes('self-signed certificate') ||
        error.message.includes('certificate')) {
      console.warn('SSL证书验证警告:', error.message);
      if (process.env.NODE_ENV !== 'production') {
        try {
          const insecureAgent = new https.Agent({
            rejectUnauthorized: false
          });
          const response = await axios.get(url, {
            params,
            httpsAgent: insecureAgent,
            timeout: 10000
          });
          
          if (response.data.errcode) {
            throw new Error(`微信API错误: ${response.data.errcode} - ${response.data.errmsg}`);
          }
          
          return response.data;
        } catch (retryError) {
          throw new Error(`获取微信用户信息失败（SSL证书问题）: ${retryError.message}`);
        }
      } else {
        throw new Error('SSL证书验证失败，请联系管理员检查服务器证书配置');
      }
    }
    
    if (error.response) {
      throw new Error(`获取微信用户信息失败: ${error.response.data?.errmsg || error.message}`);
    }
    throw new Error(`获取微信用户信息失败: ${error.message}`);
  }
};

