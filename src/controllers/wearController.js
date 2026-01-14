// src/controllers/wearController.js

const wearService = require('../services/wearService');

// 创建AI试穿任务（使用豆包4.5模型）
// 不需要请求体，所有参数在服务端封装
exports.createTryOnTask = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取

    // 直接调用服务，不需要传递任何参数
    // 所有参数（model, size, watermark, response_format）在服务端封装
    const result = await wearService.createTryOnTask(userId);

    res.status(201).json({
      success: true,
      message: '试穿图片生成成功',
      data: result
    });
  } catch (error) {
    console.error('创建试穿任务失败:', error);
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

// 获取用户的试穿记录（只返回成功的试穿记录）
exports.getUserTryOnRecords = async (req, res) => {
  try {
    const userId = req.user.userId; // 从认证中间件获取
    const { page, limit } = req.query;

    const options = {};
    if (page) options.page = parseInt(page);
    if (limit) options.limit = parseInt(limit);

    const result = await wearService.getUserTryOnRecords(userId, options);

    res.status(200).json({
      success: true,
      message: '获取试穿记录成功',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || '获取试穿记录失败'
    });
  }
};
