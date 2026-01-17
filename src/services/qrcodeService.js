// src/services/qrcodeService.js
// 微信小程序二维码生成和上传服务

const fs = require('fs');
const path = require('path');
const { wechatAppId, wechatAppSecret } = require('../config');
const { wechatAxiosInstance } = require('../utils/wechatApi');
const { uploadToWechatCloud, generateCloudPath } = require('./wechatCloudStorageService');

// 获取微信access_token（复用wechatCloudStorageService的逻辑）
let accessToken = null;
let tokenExpireTime = 0;

const getAccessToken = async () => {
  try {
    if (accessToken && Date.now() < tokenExpireTime) {
      return accessToken;
    }

    // 使用标准的 getAccessToken API（之前可以工作的方式）
    const response = await wechatAxiosInstance.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: wechatAppId,
        secret: wechatAppSecret
      }
    });

    if (response.data.errcode) {
      throw new Error(`获取access_token失败: ${response.data.errmsg}`);
    }

    accessToken = response.data.access_token;
    // token有效期7200秒，提前5分钟刷新
    const expiresIn = response.data.expires_in || 7200;
    tokenExpireTime = Date.now() + (expiresIn - 300) * 1000;

    return accessToken;
  } catch (error) {
    throw new Error(`获取微信access_token失败: ${error.message}`);
  }
};

/**
 * 生成微信小程序不限制二维码并上传到云存储
 * @param {string} shopId - 店铺ID，作为scene参数
 * @param {string} page - 小程序页面路径，可选
 * @param {number} width - 二维码宽度，默认430
 * @returns {Promise<Object>} 返回上传后的文件信息
 */
exports.generateAndUploadQRCode = async (shopId, options = {}) => {
  const { page = 'pages/index/index', width = 430 } = options;
  let tempFilePath = null;

  try {
    // 1. 获取access_token
    const token = await getAccessToken();

    // 2. 调用微信API生成小程序码
    // 关键：scene 必须是 'shopId=xxx' 格式，不能只是 'xxx'
    // 这样前端才能从 res.query.shopId 中正确获取店铺ID
    const sceneValue = `shopId=${shopId}`;
    
    const response = await wechatAxiosInstance.post(
      `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`,
      {
        scene: sceneValue, // ✅ 关键：必须是 'shopId=xxx' 格式
        page: page, // 小程序页面路径
        width: width, // 二维码宽度
        check_path: false, // 不检查页面路径是否存在（避免路径检查失败）
        env_version: 'release', // 环境版本：release（正式环境）/trial（体验版）/develop（开发版）
        auto_color: false, // 自动配置线条颜色
        line_color: { r: 0, g: 0, b: 0 }, // 线条颜色（黑色）
        is_hyaline: false // 是否需要透明底色
      },
      {
        responseType: 'arraybuffer' // 重要：接收二进制数据
      }
    );

    // 3. 检查响应是否为错误（微信API错误时返回JSON）
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      const errorData = JSON.parse(Buffer.from(response.data).toString('utf-8'));
      throw new Error(`生成小程序码失败: ${errorData.errmsg || errorData.errcode}`);
    }

    // 4. 保存到临时文件
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `qrcode_${shopId}_${Date.now()}.png`;
    tempFilePath = path.join(tempDir, filename);
    
    fs.writeFileSync(tempFilePath, response.data);

    // 5. 上传到微信云存储
    const cloudPath = generateCloudPath('qrcodes', filename);
    const uploadResult = await uploadToWechatCloud(tempFilePath, cloudPath);

    // 6. 删除临时文件
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      tempFilePath = null;
    }

    return {
      shopId: shopId,
      qrcodeUrl: uploadResult.file_url,
      file_id: uploadResult.file_id,
      cloud_path: uploadResult.cloud_path,
      page: page,
      width: width
    };
  } catch (error) {
    // 清理临时文件
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('清理临时文件失败:', cleanupError);
      }
    }
    throw error;
  }
};

