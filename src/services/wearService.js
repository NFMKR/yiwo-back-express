// src/services/wearService.js

const axios = require('axios');
const Wear = require('../models/ai_wear/wearModel');
const { dashscopeApiKey, dashscopeApiUrl } = require('../config');

// 创建AI试穿任务
exports.createTryOnTask = async (userId, taskData) => {
  try {
    const { 
      person_image_url, 
      top_garment_url, 
      bottom_garment_url,
      resolution = -1,
      restore_face = true
    } = taskData;

    // 验证必填字段
    if (!person_image_url) {
      throw new Error('模特图片URL不能为空');
    }

    if (!top_garment_url && !bottom_garment_url) {
      throw new Error('上装或下装至少需要提供一个');
    }

    // 构建请求数据
    const requestData = {
      model: 'aitryon',
      input: {
        person_image_url
      },
      parameters: {
        resolution,
        restore_face
      }
    };

    // 添加服饰图片URL
    if (top_garment_url) {
      requestData.input.top_garment_url = top_garment_url;
    }
    if (bottom_garment_url) {
      requestData.input.bottom_garment_url = bottom_garment_url;
    }

    // 调用阿里云DashScope API创建任务
    const response = await axios.post(
      `${dashscopeApiUrl}/services/aigc/image2image/image-synthesis`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dashscopeApiKey}`,
          'X-DashScope-Async': 'enable'
        }
      }
    );

    // 检查响应
    if (!response.data || !response.data.output) {
      throw new Error('API响应数据异常');
    }

    const { task_id, task_status } = response.data.output;
    const { request_id } = response.data;

    // 保存任务到数据库
    const wearTask = new Wear({
      userId,
      taskId: task_id,
      personImageUrl: person_image_url,
      topGarmentUrl: top_garment_url || null,
      bottomGarmentUrl: bottom_garment_url || null,
      resolution,
      restoreFace: restore_face,
      taskStatus: task_status,
      requestId: request_id,
      submitTime: new Date().toISOString()
    });

    await wearTask.save();

    return {
      taskId: task_id,
      taskStatus: task_status,
      requestId: request_id,
      message: '任务创建成功'
    };
  } catch (error) {
    // 处理API错误
    if (error.response) {
      throw new Error(
        error.response.data?.message || 
        error.response.data?.error || 
        `API请求失败: ${error.response.status}`
      );
    }
    throw error;
  }
};

// 查询试穿任务结果
exports.getTaskResult = async (userId, taskId) => {
  try {
    // 从数据库查找任务
    const wearTask = await Wear.findOne({ taskId, userId });
    if (!wearTask) {
      throw new Error('任务不存在或无权访问');
    }

    // 如果任务已经成功完成，直接返回数据库中的结果
    if (wearTask.taskStatus === 'SUCCEEDED' && wearTask.imageUrl) {
      return {
        taskId: wearTask.taskId,
        taskStatus: wearTask.taskStatus,
        imageUrl: wearTask.imageUrl,
        submitTime: wearTask.submitTime,
        scheduledTime: wearTask.scheduledTime,
        endTime: wearTask.endTime,
        requestId: wearTask.requestId
      };
    }

    // 如果任务失败，返回错误信息
    if (wearTask.taskStatus === 'FAILED') {
      return {
        taskId: wearTask.taskId,
        taskStatus: wearTask.taskStatus,
        errorCode: wearTask.errorCode,
        errorMessage: wearTask.errorMessage,
        requestId: wearTask.requestId
      };
    }

    // 否则从API查询最新状态
    const response = await axios.get(
      `${dashscopeApiUrl}/tasks/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${dashscopeApiKey}`
        }
      }
    );

    if (!response.data || !response.data.output) {
      throw new Error('API响应数据异常');
    }

    const { output, request_id, usage } = response.data;

    // 更新数据库中的任务状态
    wearTask.taskStatus = output.task_status;
    wearTask.requestId = request_id;
    
    if (output.submit_time) {
      wearTask.submitTime = output.submit_time;
    }
    if (output.scheduled_time) {
      wearTask.scheduledTime = output.scheduled_time;
    }
    if (output.end_time) {
      wearTask.endTime = output.end_time;
    }

    // 如果任务成功，保存图片URL
    if (output.task_status === 'SUCCEEDED' && output.image_url) {
      wearTask.imageUrl = output.image_url;
    }

    // 如果任务失败，保存错误信息
    if (output.task_status === 'FAILED') {
      wearTask.errorCode = output.code || null;
      wearTask.errorMessage = output.message || null;
    }

    await wearTask.save();

    // 构建返回数据
    const result = {
      taskId: output.task_id,
      taskStatus: output.task_status,
      submitTime: output.submit_time,
      scheduledTime: output.scheduled_time,
      endTime: output.end_time,
      requestId: request_id
    };

    if (output.image_url) {
      result.imageUrl = output.image_url;
      result.message = '任务已完成，图片URL有效期为24小时，请及时下载';
    }

    if (output.task_status === 'FAILED') {
      result.errorCode = output.code;
      result.errorMessage = output.message;
    }

    if (usage) {
      result.usage = usage;
    }

    return result;
  } catch (error) {
    // 处理API错误
    if (error.response) {
      throw new Error(
        error.response.data?.message || 
        error.response.data?.error || 
        `API请求失败: ${error.response.status}`
      );
    }
    throw error;
  }
};

// 获取用户的所有试穿任务
exports.getUserTasks = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options;
    
    const query = { userId };
    if (status) {
      query.taskStatus = status;
    }

    const tasks = await Wear.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    const total = await Wear.countDocuments(query);

    return {
      tasks,
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

// 获取用户的试穿记录（只返回成功的试穿记录）
exports.getUserTryOnRecords = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    // 只查询成功的试穿记录，且必须有图片URL
    const query = {
      userId,
      taskStatus: 'SUCCEEDED',
      imageUrl: { $ne: null } // 确保有试穿效果图
    };

    const records = await Wear.find(query)
      .sort({ endTime: -1 }) // 按完成时间倒序，最新的在前面
      .skip((page - 1) * limit)
      .limit(limit)
      .select('imageUrl endTime topGarmentUrl bottomGarmentUrl taskId createdAt');

    const total = await Wear.countDocuments(query);

    // 格式化返回数据
    const formattedRecords = records.map(record => ({
      taskId: record.taskId,
      resultImageUrl: record.imageUrl, // 试穿效果图
      endTime: record.endTime, // 完成时间
      topGarmentUrl: record.topGarmentUrl, // 上衣图片
      bottomGarmentUrl: record.bottomGarmentUrl, // 下衣图片
      createdAt: record.createdAt // 创建时间
    }));

    return {
      records: formattedRecords,
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

