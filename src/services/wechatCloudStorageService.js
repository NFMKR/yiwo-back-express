// src/services/wechatCloudStorageService.js

const fs = require('fs');
const FormData = require('form-data');
const { wechatAppId, wechatAppSecret, wechatCloudEnvId } = require('../config');
const { wechatAxiosInstance } = require('../utils/wechatApi'); // 使用微信专用axios实例（跳过SSL证书校验）

// 获取微信云开发access_token（统一管理，避免多个服务独立缓存导致token不一致）
let accessToken = null;
let tokenExpireTime = 0;
let tokenRefreshPromise = null; // 用于防止并发时重复获取token

const getAccessToken = async () => {
  try {
    // 如果token未过期，直接返回
    if (accessToken && Date.now() < tokenExpireTime) {
      return accessToken;
    }

    // 如果正在刷新token，等待刷新完成
    if (tokenRefreshPromise) {
      return await tokenRefreshPromise;
    }

    // 开始获取新token（使用getStableAccessToken，稳定版token，避免并发冲突）
    tokenRefreshPromise = (async () => {
      try {
        // 优先使用稳定版token API（推荐，避免并发冲突）
        let response;
        try {
          response = await wechatAxiosInstance.post('https://api.weixin.qq.com/cgi-bin/stable_token', {
            grant_type: 'client_credential',
            appid: wechatAppId,
            secret: wechatAppSecret,
            force_refresh: false // 不强制刷新，如果有有效token则复用
          });
        } catch (stableTokenError) {
          // 如果稳定版API失败，回退到标准API
          console.warn('稳定版token API失败，回退到标准API:', stableTokenError.message);
          response = await wechatAxiosInstance.get('https://api.weixin.qq.com/cgi-bin/token', {
            params: {
              grant_type: 'client_credential',
              appid: wechatAppId,
              secret: wechatAppSecret
            }
          });
        }

        if (response.data.errcode) {
          throw new Error(`获取access_token失败: ${response.data.errmsg || response.data.errcode}`);
        }

        const newToken = response.data.access_token;
        // token有效期7200秒，提前5分钟刷新
        const expiresIn = response.data.expires_in || 7200;
        const newExpireTime = Date.now() + (expiresIn - 300) * 1000;

        // 更新token
        accessToken = newToken;
        tokenExpireTime = newExpireTime;

        return newToken;
      } finally {
        // 清除刷新Promise，允许下次刷新
        tokenRefreshPromise = null;
      }
    })();

    return await tokenRefreshPromise;
  } catch (error) {
    // 如果获取失败，清除刷新Promise
    tokenRefreshPromise = null;
    throw new Error(`获取微信access_token失败: ${error.message}`);
  }
};

// 获取上传凭证
const getUploadInfo = async (cloudPath) => {
  try {
    const token = await getAccessToken();
    
    // 使用微信专用axios实例（跳过SSL证书校验）
    const response = await wechatAxiosInstance.post(
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

// 获取文件下载URL（永久URL，使用最大有效期）
const getFileDownloadUrl = async (fileId) => {
  try {
    const token = await getAccessToken();
    
    // 使用最大有效期（10年，约315360000秒）
    const maxAge = 315360000;
    
    // 使用微信专用axios实例（跳过SSL证书校验）
    const response = await wechatAxiosInstance.post(
      `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${token}`,
      {
        env: wechatCloudEnvId,
        file_list: [
          {
            fileid: fileId,
            max_age: maxAge // 永久URL，使用最大有效期（10年）
          }
        ]
      }
    );

    console.log('获取下载URL API响应:', JSON.stringify(response.data, null, 2));

    if (response.data.errcode !== 0) {
      throw new Error(`获取文件下载URL失败: ${response.data.errmsg || response.data.errcode}`);
    }

    if (response.data.file_list && response.data.file_list.length > 0) {
      const downloadUrl = response.data.file_list[0].download_url;
      if (!downloadUrl || downloadUrl.trim() === '') {
        throw new Error('API返回的download_url为空');
      }
      return downloadUrl;
    }

    throw new Error('未获取到文件下载URL，响应数据: ' + JSON.stringify(response.data));
  } catch (error) {
    console.error('getFileDownloadUrl错误:', error.message);
    throw error;
  }
};

// 构建永久CDN URL（不带签名，需要文件设置为公开访问）
const buildPermanentUrl = (cloudPath) => {
  // 从环境ID构建CDN域名
  // 格式：https://{env-id}.tcb.qcloud.la/{path}
  // 例如：https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/8888/2026/01/13/xxx.png
  const cdnDomain = `${wechatCloudEnvId}.tcb.qcloud.la`;
  return `https://${cdnDomain}/${cloudPath}`;
};

// 上传文件到微信云托管对象存储
exports.uploadToWechatCloud = async (localFilePath, cloudPath) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error('本地文件不存在');
    }

    // 1. 获取上传凭证
    const uploadInfo = await getUploadInfo(cloudPath);
    console.log('获取上传凭证成功:', {
      hasFileId: !!uploadInfo.file_id,
      fileId: uploadInfo.file_id,
      hasUrl: !!uploadInfo.url,
      hasAuthorization: !!uploadInfo.authorization
    });

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

    // 4. 上传文件到COS（使用微信专用axios实例，跳过SSL证书校验）
    const uploadResponse = await wechatAxiosInstance.post(uploadInfo.url, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log('文件上传到COS成功，状态码:', uploadResponse.status);

    // 5. 验证上传信息
    if (!uploadInfo.file_id) {
      throw new Error('上传成功但未获取到file_id');
    }

    // 6. 获取文件的永久下载URL
    let downloadUrl;
    try {
      // 获取带签名的长期有效URL（10年有效期，约315360000秒）
      // 这个URL格式类似：https://xxx.tcb.qcloud.la/path?sign=xxx&t=xxx
      downloadUrl = await getFileDownloadUrl(uploadInfo.file_id);
      
      // 检查返回的URL是否为空
      if (!downloadUrl || downloadUrl.trim() === '') {
        throw new Error('API返回的download_url为空');
      }
      
      console.log('成功获取文件下载URL:', downloadUrl);
    } catch (error) {
      console.warn('获取文件下载URL失败，尝试从file_id构建:', error.message);
      // 如果获取失败，尝试从file_id解析构建URL
      // file_id格式：cloud://env-id.bucket-id/path
      // 例如：cloud://prod-4g0apka18663bf93.7072-prod-4g0apka18663bf93-1395010318/hh/2026/01/13/xxx.jpg
      try {
        // 从file_id中提取bucket-id和path
        const fileIdMatch = uploadInfo.file_id.match(/cloud:\/\/([^\.]+)\.([^\/]+)\/(.+)/);
        if (fileIdMatch) {
          const [, envId, bucketId, path] = fileIdMatch;
          // 构建CDN URL：https://{bucket-id}.tcb.qcloud.la/{path}
          downloadUrl = `https://${bucketId}.tcb.qcloud.la/${path}`;
          console.log('从file_id构建URL成功:', downloadUrl);
        } else {
          console.warn('file_id格式不匹配，使用cloud_path构建');
          // 如果解析失败，使用cloud_path构建
          downloadUrl = buildPermanentUrl(cloudPath);
          console.log('使用cloud_path构建URL:', downloadUrl);
        }
      } catch (err) {
        console.error('构建永久URL失败:', err.message);
        // 最后回退到file_id（小程序中可以直接使用）
        downloadUrl = uploadInfo.file_id;
        console.log('回退使用file_id作为URL:', downloadUrl);
      }
    }

    // 确保downloadUrl不为空
    if (!downloadUrl || downloadUrl.trim() === '') {
      throw new Error('无法生成文件URL，file_id: ' + uploadInfo.file_id);
    }

    // 7. 返回文件信息
    return {
      file_id: uploadInfo.file_id,
      cloud_path: cloudPath,
      file_url: downloadUrl, // 完整的永久下载URL
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

