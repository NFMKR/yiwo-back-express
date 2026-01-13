// src/services/fileService.js

const File = require('../models/fileModel');
const wechatCloudStorageService = require('./wechatCloudStorageService');
const fs = require('fs');
const path = require('path');

// 保存上传文件信息
exports.saveFileInfo = async (userId, fileData) => {
  try {
    const {
      file_id,
      cloud_path,
      file_url,
      file_type = 'image',
      file_size = 0,
      category = '',
      description = ''
    } = fileData;

    // 验证必填字段
    if (!file_id || !cloud_path || !file_url) {
      throw new Error('文件ID、云存储路径和文件URL不能为空');
    }

    // 检查文件ID是否已存在
    const existingFile = await File.findOne({ file_id });
    if (existingFile) {
      // 如果已存在，更新信息
      existingFile.file_url = file_url;
      existingFile.file_type = file_type;
      existingFile.file_size = file_size;
      existingFile.category = category;
      existingFile.description = description;
      existingFile.updatedAt = Date.now();
      await existingFile.save();

      return {
        file: {
          id: existingFile._id,
          file_id: existingFile.file_id,
          cloud_path: existingFile.cloud_path,
          file_url: existingFile.file_url,
          file_type: existingFile.file_type,
          file_size: existingFile.file_size,
          category: existingFile.category,
          description: existingFile.description,
          createdAt: existingFile.createdAt,
          updatedAt: existingFile.updatedAt
        },
        isNew: false
      };
    }

    // 创建新文件记录
    const file = new File({
      user_id: userId,
      file_id,
      cloud_path,
      file_url,
      file_type,
      file_size,
      category,
      description
    });

    await file.save();

    return {
      file: {
        id: file._id,
        file_id: file.file_id,
        cloud_path: file.cloud_path,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size,
        category: file.category,
        description: file.description,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      },
      isNew: true
    };
  } catch (error) {
    throw error;
  }
};

// 获取用户文件列表
exports.getUserFiles = async (userId, options = {}) => {
  try {
    const { 
      file_type, 
      category, 
      page = 1, 
      limit = 20 
    } = options;

    // 构建查询条件
    const query = { user_id: userId };
    if (file_type) query.file_type = file_type;
    if (category) query.category = category;

    // 查询文件列表
    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    const total = await File.countDocuments(query);

    return {
      files: files.map(file => ({
        id: file._id,
        file_id: file.file_id,
        cloud_path: file.cloud_path,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size,
        category: file.category,
        description: file.description,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// 删除文件记录
exports.deleteFile = async (userId, fileId) => {
  try {
    // 查找文件（确保是用户的文件）
    const file = await File.findOne({ _id: fileId, user_id: userId });
    if (!file) {
      throw new Error('文件不存在或无权限删除');
    }

    // 删除文件记录
    await File.findByIdAndDelete(fileId);

    return {
      message: '文件记录删除成功',
      file_id: file.file_id,
      cloud_path: file.cloud_path
    };
  } catch (error) {
    throw error;
  }
};

// 批量保存文件信息
exports.batchSaveFiles = async (userId, filesData) => {
  try {
    const results = [];
    
    for (const fileData of filesData) {
      try {
        const result = await exports.saveFileInfo(userId, fileData);
        results.push(result);
      } catch (error) {
        results.push({
          error: error.message,
          fileData
        });
      }
    }

    return {
      success: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results
    };
  } catch (error) {
    throw error;
  }
};

// 处理文件上传（从本地文件上传到微信云存储并保存信息）
exports.uploadFile = async (userId, localFilePath, options = {}) => {
  try {
    const {
      category = 'images',
      description = '',
      file_type = 'image'
    } = options;

    // 验证本地文件是否存在
    if (!fs.existsSync(localFilePath)) {
      throw new Error('本地文件不存在');
    }

    // 获取文件信息
    const fileStats = fs.statSync(localFilePath);
    const fileSize = fileStats.size;
    const originalName = path.basename(localFilePath);
    const ext = path.extname(originalName);

    // 生成云存储路径
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    const cloudPath = wechatCloudStorageService.generateCloudPath(category, filename);

    // 上传到微信云存储
    const uploadResult = await wechatCloudStorageService.uploadToWechatCloud(localFilePath, cloudPath);

    // 保存文件信息到数据库
    const fileInfo = await exports.saveFileInfo(userId, {
      file_id: uploadResult.file_id,
      cloud_path: uploadResult.cloud_path,
      file_url: uploadResult.file_url,
      file_type: file_type,
      file_size: fileSize,
      category: category,
      description: description
    });

    // 删除本地临时文件
    try {
      fs.unlinkSync(localFilePath);
    } catch (error) {
      console.warn('删除本地临时文件失败:', error.message);
    }

    return fileInfo;
  } catch (error) {
    // 如果上传失败，尝试删除本地文件
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.warn('清理本地文件失败:', err.message);
      }
    }
    throw error;
  }
};

