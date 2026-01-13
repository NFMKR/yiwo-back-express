// src/controllers/fileController.js

const fileService = require('../services/fileService');
const fs = require('fs');

// 单文件上传接口（通用接口）
exports.uploadFile = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    // 获取上传参数（可选）
    const category = req.body.category || 'images';
    const description = req.body.description || '';
    const file_type = req.body.file_type || 'image';

    // 获取文件路径
    const localFilePath = req.file.path;

    // 上传文件到微信云存储并保存信息
    const result = await fileService.uploadFile(userId, localFilePath, {
      category,
      description,
      file_type
    });

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: result
    });
  } catch (error) {
    // 如果上传失败，尝试删除临时文件
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.warn('清理临时文件失败:', err.message);
      }
    }

    res.status(400).json({
      success: false,
      message: error.message || '文件上传失败'
    });
  }
};
