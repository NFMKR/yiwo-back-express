// src/controllers/wearController.js

const wearService = require('../services/wearService');

// 创建AI试穿任务
exports.createTryOnTask = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const {
      person_image_url,
      top_garment_url,
      bottom_garment_url,
      resolution,
      restore_face
    } = req.body;

    // 验证必填字段
    if (!person_image_url) {
      return res.status(400).json({
        success: false,
        message: '模特图片URL不能为空'
      });
    }

    if (!top_garment_url && !bottom_garment_url) {
      return res.status(400).json({
        success: false,
        message: '上装或下装至少需要提供一个'
      });
    }

    const result = await wearService.createTryOnTask(userId, {
      person_image_url,
      top_garment_url,
      bottom_garment_url,
      resolution,
      restore_face
    });

    res.status(201).json({
      success: true,
      message: '试穿任务创建成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '创建试穿任务失败'
    });
  }
};

// 查询试穿任务结果
exports.getTaskResult = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: '任务ID不能为空'
      });
    }

    const result = await wearService.getTaskResult(userId, taskId);

    res.status(200).json({
      success: true,
      message: '查询成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '查询任务结果失败'
    });
  }
};

// 获取用户的所有试穿任务
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { page, limit, status } = req.query;

    const options = {};
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);
    if (status) options.status = status;

    const result = await wearService.getUserTasks(userId, options);

    res.status(200).json({
      success: true,
      message: '获取任务列表成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取任务列表失败'
    });
  }
};

// 使用默认值创建测试任务（用于快速测试）
exports.createTestTask = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    
    // 使用文档中的默认示例图片
    const defaultTaskData = {
      person_image_url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250626/ubznva/model_person.png',
      top_garment_url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250626/epousa/short_sleeve.jpeg',
      bottom_garment_url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250626/rchumi/pants.jpeg',
      resolution: -1,
      restore_face: true
    };

    const result = await wearService.createTryOnTask(userId, defaultTaskData);

    res.status(201).json({
      success: true,
      message: '测试任务创建成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '创建测试任务失败'
    });
  }
};

