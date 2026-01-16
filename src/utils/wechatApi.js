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

  // 验证 code 格式（微信 code 通常是字符串，长度在 20-200 之间）
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('微信code格式无效：code不能为空');
  }

  const url = `${wechatApiUrl}/sns/jscode2session`;
  const params = {
    appid: wechatAppId,
    secret: wechatAppSecret,
    js_code: code,
    grant_type: 'authorization_code'
  };

  try {
    console.log('请求微信API获取openid:', {
      url,
      appid: wechatAppId,
      codeLength: code.length,
      codePrefix: code.substring(0, 10) + '...' // 只记录前10个字符，保护隐私
    });

    // 使用微信专用axios实例（已配置跳过SSL证书校验）
    const response = await wechatAxiosInstance.get(url, { params });

    // 处理微信API返回的错误
    if (response.data.errcode) {
      const errcode = response.data.errcode;
      const errmsg = response.data.errmsg;
      
      // 针对常见错误码提供更详细的错误信息
      let detailedMessage = `微信API错误: ${errcode} - ${errmsg}`;
      
      switch (errcode) {
        case 40029:
          detailedMessage = `微信code无效(40029)。可能原因：
1. code已过期（微信code有效期约5分钟）
2. code已被使用过（每个code只能使用一次）
3. 本地模拟器使用的AppID与线上环境不一致
4. 请确保使用最新获取的code，且未重复使用
建议：重新调用wx.login()获取新的code`;
          break;
        case 40013:
          detailedMessage = `无效的AppID(40013)。请检查.env中的WECHAT_APP_ID配置是否正确`;
          break;
        case 40125:
          detailedMessage = `无效的AppSecret(40125)。请检查.env中的WECHAT_APP_SECRET配置是否正确`;
          break;
        case 45011:
          detailedMessage = `API调用太频繁(45011)。请稍后再试`;
          break;
        default:
          detailedMessage = `微信API错误: ${errcode} - ${errmsg}`;
      }
      
      console.error('微信API返回错误:', {
        errcode,
        errmsg,
        appid: wechatAppId,
        codeLength: code.length
      });
      
      throw new Error(detailedMessage);
    }

    console.log('成功获取微信openid:', {
      openid: response.data.openid ? response.data.openid.substring(0, 10) + '...' : 'null',
      hasSessionKey: !!response.data.session_key,
      hasUnionid: !!response.data.unionid
    });

    return {
      openid: response.data.openid,
      session_key: response.data.session_key,
      unionid: response.data.unionid || null
    };
  } catch (error) {
    // 如果错误已经被处理过（有详细消息），直接抛出
    if (error.message && error.message.includes('微信API错误')) {
      throw error;
    }
    
    // 处理网络错误或其他错误
    if (error.response) {
      const errcode = error.response.data?.errcode;
      const errmsg = error.response.data?.errmsg || error.message;
      console.error('微信API请求失败:', {
        status: error.response.status,
        errcode,
        errmsg,
        appid: wechatAppId
      });
      throw new Error(`微信API请求失败: ${errmsg}`);
    }
    
    console.error('微信API请求异常:', {
      message: error.message,
      stack: error.stack,
      appid: wechatAppId
    });
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

