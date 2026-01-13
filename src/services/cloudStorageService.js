// src/services/cloudStorageService.js

const COS = require('cos-nodejs-sdk-v5');
const fs = require('fs');
const path = require('path');
const { wechatCloudEnvId, wechatCloudBucket } = require('../config');

// 初始化腾讯云COS客户端
// 注意：需要配置腾讯云COS的SecretId和SecretKey
let cosClient = null;

const initCOS = () => {
  if (!cosClient && process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY) {
    cosClient = new COS({
      SecretId: process.env.TENCENT_SECRET_ID,
      SecretKey: process.env.TENCENT_SECRET_KEY,
      Region: process.env.TENCENT_REGION || 'ap-shanghai' // 默认上海区域
    });
  }
  return cosClient;
};

// 上传文件到腾讯云COS
exports.uploadToCOS = async (localFilePath, cloudPath, options = {}) => {
  try {
    const client = initCOS();
    
    if (!client) {
      throw new Error('腾讯云COS未配置，请设置TENCENT_SECRET_ID和TENCENT_SECRET_KEY环境变量');
    }

    if (!fs.existsSync(localFilePath)) {
      throw new Error('本地文件不存在');
    }

    const bucket = wechatCloudBucket || process.env.TENCENT_BUCKET;
    if (!bucket) {
      throw new Error('存储桶名称未配置');
    }

    // 读取文件
    const fileContent = fs.readFileSync(localFilePath);
    
    // 上传文件
    const result = await client.putObject({
      Bucket: bucket,
      Region: process.env.TENCENT_REGION || 'ap-shanghai',
      Key: cloudPath,
      Body: fileContent,
      ...options
    });

    // 构建文件URL
    // 如果配置了CDN域名，使用CDN域名，否则使用COS默认域名
    const cdnDomain = process.env.TENCENT_CDN_DOMAIN;
    let fileUrl;
    
    if (cdnDomain) {
      fileUrl = `https://${cdnDomain}/${cloudPath}`;
    } else {
      // 使用COS默认域名
      const region = process.env.TENCENT_REGION || 'ap-shanghai';
      fileUrl = `https://${bucket}.cos.${region}.myqcloud.com/${cloudPath}`;
    }

    return {
      file_id: `cloud://${wechatCloudEnvId || 'default'}.${cloudPath}`,
      cloud_path: cloudPath,
      file_url: fileUrl,
      location: result.Location,
      etag: result.ETag
    };
  } catch (error) {
    throw new Error(`上传到云存储失败：${error.message}`);
  }
};

// 删除云存储中的文件
exports.deleteFromCOS = async (cloudPath) => {
  try {
    const client = initCOS();
    
    if (!client) {
      throw new Error('腾讯云COS未配置');
    }

    const bucket = wechatCloudBucket || process.env.TENCENT_BUCKET;
    if (!bucket) {
      throw new Error('存储桶名称未配置');
    }

    await client.deleteObject({
      Bucket: bucket,
      Region: process.env.TENCENT_REGION || 'ap-shanghai',
      Key: cloudPath
    });

    return true;
  } catch (error) {
    throw new Error(`删除云存储文件失败：${error.message}`);
  }
};

// 生成云存储路径
exports.generateCloudPath = (category = 'images', filename) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // 格式：category/年/月/日/文件名
  return `${category}/${year}/${month}/${day}/${filename}`;
};

