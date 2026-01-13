// src/services/wechatCloudStorageService.js

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { wechatAppId, wechatAppSecret, wechatCloudEnvId } = require('../config');

// 获取微信云开发access_token
let accessToken = null;
let tokenExpireTime = 0;

const getAccessToken = async () => {
  try {
    // 如果token未过期，直接返回
    if (accessToken && Date.now() < tokenExpireTime) {
      return accessToken;
    }

    // 获取新的access_token
    const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
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
    tokenExpireTime = Date.now() + (response.data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    throw new Error(`获取微信access_token失败: ${error.message}`);
  }
};

// 获取上传凭证
const getUploadInfo = async (cloudPath) => {
  try {
    const token = await getAccessToken();
    
    const response = await axios.post(
      `https://api.weixin.qq.com/tcb/uploadfile?access_token=${token}`,
      {
        env: wechatCloudEnvId,
        path: cloudPath
      }
    );

    if (response.data.errcode !== 0) {
      throw new Error(`获取上传凭证失败: ${response.data.errmsg}`);
    }

    return response.data;
  } catch (error) {
    throw new Error(`获取上传凭证失败: ${error.message}`);
  }
};

// 上传文件到微信云托管对象存储
exports.uploadToWechatCloud = async (localFilePath, cloudPath) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error('本地文件不存在');
    }

    // 1. 获取上传凭证
    const uploadInfo = await getUploadInfo(cloudPath);

    // 2. 读取文件
    const fileStream = fs.createReadStream(localFilePath);
    const fileStats = fs.statSync(localFilePath);

    // 3. 构建上传表单
    const formData = new FormData();
    formData.append('key', cloudPath);
    formData.append('Signature', uploadInfo.authorization);
    formData.append('x-cos-security-token', uploadInfo.token);
    formData.append('x-cos-meta-fileid', uploadInfo.file_id);
    formData.append('file', fileStream, {
      knownLength: fileStats.size
    });

    // 4. 上传文件到COS
    const uploadResponse = await axios.post(uploadInfo.url, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // 5. 返回文件信息
    return {
      file_id: uploadInfo.file_id,
      cloud_path: cloudPath,
      file_url: uploadInfo.file_id, // 微信云存储的file_id可以直接作为URL使用
      file_size: fileStats.size
    };
  } catch (error) {
    throw new Error(`上传到微信云存储失败: ${error.message}`);
  }
};

// 生成云存储路径
exports.generateCloudPath = (category = 'images', filename) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  
  // 格式：category/年/月/日/时间戳-随机数-文件名
  return `${category}/${year}/${month}/${day}/${timestamp}-${random}-${filename}`;
};

