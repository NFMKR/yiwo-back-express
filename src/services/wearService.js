// src/services/wearService.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Wear = require('../models/ai_wear/wearModel');
const ModelPerson = require('../models/model/modelPersonModel');
const Clothes = require('../models/clothes/clothesModel');
const { arkApiKey, arkApiUrl, arkModel } = require('../config');
const { generateDefaultModelData } = require('../utils/defaultModelData');
const modelPersonService = require('./modelPersonService');
const { uploadToWechatCloud, generateCloudPath } = require('./wechatCloudStorageService');

// 构建穿搭提示词
const buildOutfitPrompt = (modelInfo, clothesUrls = []) => {
  let prompt = '生成一张高质量的穿搭效果图，';
  
  // 模特基本信息（只描述有值的字段）
  if (modelInfo.gender) {
    prompt += `模特是${modelInfo.gender}性，`;
  }
  if (modelInfo.age_stage) {
    prompt += `${modelInfo.age_stage}出生的，`;
  }
  if (modelInfo.height) {
    prompt += `身高${modelInfo.height}cm，`;
  }
  if (modelInfo.weight) {
    prompt += `体重${modelInfo.weight}kg，`;
  }
  if (modelInfo.body_feature) {
    prompt += `${modelInfo.body_feature}体型，`;
  }
  
  // 风格偏好（只描述有值的字段）
  if (modelInfo.style_preference) {
    prompt += `风格偏好：${modelInfo.style_preference}，`;
  }
  if (modelInfo.shooting_style) {
    prompt += `拍摄风格：${modelInfo.shooting_style}，`;
  }
  if (modelInfo.mood) {
    prompt += `情绪氛围：${modelInfo.mood}，`;
  }
  
  // 衣服描述（只描述有值的字段）
  if (clothesUrls.length > 0) {
    prompt += `参考提供的${clothesUrls.length}张衣服图片进行穿搭，`;
  }
  
  // 场景描述（只描述有值的字段）
  if (modelInfo.suitable_weather) {
    prompt += `适合${modelInfo.suitable_weather}季节穿着，`;
  }
  
  // 最终要求
  prompt += '要求：人物自然站立，全身清晰可见，服装搭配协调美观，背景简洁，光线自然，细节精致，专业摄影品质。';
  
  return prompt;
};

// 创建AI试穿任务（使用豆包4.5模型）
// 所有参数在服务端封装，不需要从外部传入
exports.createTryOnTask = async (userId) => {
  try {
    // 封装默认参数
    const model = arkModel || 'doubao-seedream-4-5-251128'; // 模型，默认doubao-seedream-4-5-251128
    const size = '2K'; // 图片尺寸，默认2K
    const watermark = false; // 是否添加水印，默认false
    const response_format = 'url'; // 返回格式，默认url

    // 获取用户的模特信息
    let modelPerson = await ModelPerson.findOne({ user_id: userId, status: '启用' });
    
    // 如果用户没有模特，自动创建一个带示例数据的模特
    if (!modelPerson) {
      console.log('用户未创建模特，自动创建示例模特...');
      const defaultModelData = generateDefaultModelData();
      
      // 调用modelPersonService创建模特
      const createResult = await modelPersonService.createOrUpdateUserModel(userId, defaultModelData);
      modelPerson = await ModelPerson.findOne({ user_id: userId, status: '启用' });
      
      if (!modelPerson) {
        throw new Error('自动创建模特失败，请稍后重试');
      }
      
      console.log('自动创建模特成功，使用示例数据');
    }

    // 验证URL格式的正则表达式
    const urlPattern = /^https?:\/\/.+/i;

    // 获取模特的当前头像作为人像图片
    let personImageUrl = modelPerson.current_avatar_url;
    
    if (!personImageUrl) {
      throw new Error('模特的当前头像不能为空，请先设置模特的current_avatar_url');
    }

    // 验证模特图片URL格式
    if (!urlPattern.test(personImageUrl)) {
      throw new Error(`模特的当前头像URL格式无效: ${personImageUrl}。请确保是有效的HTTP/HTTPS链接`);
    }

    // 从模特信息中自动获取衣服URL和ID（收集所有非空的衣服字段）
    const clothesUrls = [];
    const clothesInfo = []; // 存储衣服的完整信息（ID、URL、类型、二维码）
    const clothesFields = [
      { name: 'top_garment', url: modelPerson.top_garment, id: modelPerson.top_garment_id, positionType: '上装' },
      { name: 'bottom_garment', url: modelPerson.bottom_garment, id: modelPerson.bottom_garment_id, positionType: '下装' },
      { name: 'outerwear', url: modelPerson.outerwear, id: modelPerson.outerwear_id, positionType: '外套' },
      { name: 'headwear', url: modelPerson.headwear, id: modelPerson.headwear_id, positionType: '头饰/帽' },
      { name: 'shoes', url: modelPerson.shoes, id: modelPerson.shoes_id, positionType: '鞋' },
      { name: 'bag', url: modelPerson.bag, id: modelPerson.bag_id, positionType: '包袋' },
      { name: 'accessories', url: modelPerson.accessories, id: modelPerson.accessories_id, positionType: '配饰' },
      { name: 'other_clothing', url: modelPerson.other_clothing, id: modelPerson.other_clothing_id, positionType: '其他' }
    ];

    // 收集所有非空的衣服URL和ID，并验证URL格式
    for (const field of clothesFields) {
      if (field.url && field.url.trim() !== '') {
        const trimmedUrl = field.url.trim();
        // 只添加有效的URL（以http://或https://开头）
        if (urlPattern.test(trimmedUrl)) {
          clothesUrls.push(trimmedUrl);
          
          // 如果有ID，查找衣服信息获取二维码
          let shopQrImageUrl = '';
          if (field.id && field.id.trim() !== '') {
            try {
              const clothes = await Clothes.findOne({ clothesId: field.id.trim() });
              if (clothes && clothes.shop_qr_image_url) {
                shopQrImageUrl = clothes.shop_qr_image_url;
              }
            } catch (err) {
              console.warn(`查找衣服信息失败（${field.name}）:`, err.message);
            }
          }
          
          clothesInfo.push({
            field: field.name,
            clothesId: field.id || '',
            clothesUrl: trimmedUrl,
            positionType: field.positionType,
            shopQrImageUrl: shopQrImageUrl
          });
        } else {
          console.warn(`跳过无效的衣服URL（${field.name}不是有效的HTTP/HTTPS链接）:`, trimmedUrl);
        }
      }
    }

    // 验证衣服URL数量（至少需要一张衣服图片）
    if (clothesUrls.length === 0) {
      throw new Error('模特的衣服信息为空，请至少设置一张衣服图片URL');
    }

    if (clothesUrls.length > 14) {
      throw new Error('模特的衣服数量过多，最多支持14张参考图片');
    }

    // 构建提示词
    const prompt = buildOutfitPrompt(modelPerson, clothesUrls);

    // 构建图片数组（第一张是模特图片，后面是衣服图片）
    // 豆包4.5支持多图输入，第一张作为主体（模特），后续作为参考（衣服）
    const imageArray = [personImageUrl, ...clothesUrls];
    
    console.log('图片数组:', {
      personImage: personImageUrl,
      clothesCount: clothesUrls.length,
      clothesUrls: clothesUrls,
      totalImages: imageArray.length
    });

    // 构建请求数据
    const requestData = {
      model: model,
      prompt: prompt,
      image: imageArray,
      sequential_image_generation: 'disabled', // 单图模式
      size: size, // 图片尺寸，默认2K
      watermark: watermark, // 是否添加水印，默认false
      response_format: response_format // 返回格式，默认url
    };

    console.log('豆包API请求数据:', {
      model: requestData.model,
      promptLength: prompt.length,
      imageCount: imageArray.length,
      size: requestData.size
    });

    // 调用豆包API
    // 验证API Key是否存在
    if (!arkApiKey) {
      throw new Error('豆包API Key未配置，请在.env文件中设置ARK_API_KEY');
    }

    // 火山引擎的API key格式：可能是 Bearer {key} 或者直接 {key}
    // 根据错误信息，尝试不同的格式
    let authHeader;
    if (arkApiKey && typeof arkApiKey === 'string' && arkApiKey.startsWith('Bearer ')) {
      authHeader = arkApiKey;
    } else {
      // 尝试直接使用，或者添加Bearer前缀
      authHeader = `Bearer ${arkApiKey}`;
    }
    
    console.log('API Key格式检查:', {
      keyLength: arkApiKey?.length,
      keyPrefix: arkApiKey?.substring(0, 10),
      authHeader: authHeader.substring(0, 20) + '...',
      model: model
    });

    let response;
    try {
      response = await axios.post(
        `${arkApiUrl}/images/generations`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          }
        }
      );
    } catch (error) {
      // 处理请求错误
      if (error.response) {
        const errorData = error.response.data;
        const errorMsg = errorData?.error?.message || errorData?.message || `HTTP ${error.response.status}`;
        throw new Error(`豆包API请求失败: ${errorMsg}。请检查：1. 模型名称是否正确（当前使用: ${model}，可在.env中设置ARK_MODEL）2. API Key是否正确 3. 是否需要在火山引擎控制台创建Endpoint`);
      }
      throw error;
    }

    // 检查响应
    if (!response.data) {
      throw new Error('API响应数据异常');
    }

    // 处理错误响应
    if (response.data.error) {
      const errorMsg = response.data.error.message || response.data.error.code || 'API请求失败';
      throw new Error(`豆包API错误: ${errorMsg}。请检查：1. 模型名称是否正确（当前使用: ${model}）2. API Key是否有访问该模型的权限 3. 是否需要在火山引擎控制台配置Endpoint ID`);
    }

    // 获取生成的图片
    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('未生成图片');
    }

    // 取第一张生成的图片
    const generatedImage = response.data.data[0];
    const doubaoImageUrl = generatedImage.url || generatedImage.b64_json;

    if (!doubaoImageUrl) {
      throw new Error('生成的图片URL为空');
    }

    console.log('豆包API生成成功:', {
      doubaoImageUrl: doubaoImageUrl,
      size: generatedImage.size,
      model: response.data.model,
      created: response.data.created
    });

    // 先使用豆包URL，图片上传改为异步后台任务（避免超时）
    // 504超时问题：云托管网关超时通常是60秒，而豆包API + 下载 + 上传可能超过这个时间
    // 解决方案：先返回结果给用户，图片上传在后台异步进行
    let imageUrl = doubaoImageUrl; // 默认使用豆包URL（先返回给用户）

    // 保存任务到数据库（在清空衣服字段之前，记录衣服信息）
    const topGarmentUrl = modelPerson.top_garment || null;
    const bottomGarmentUrl = modelPerson.bottom_garment || null;
    
    const wearTask = new Wear({
      userId,
      taskId: response.data.created?.toString() || Date.now().toString(), // 使用创建时间戳作为任务ID
      personImageUrl: personImageUrl,
      topGarmentUrl: topGarmentUrl, // 兼容旧数据
      bottomGarmentUrl: bottomGarmentUrl, // 兼容旧数据
      clothes: clothesInfo, // 记录衣服的完整信息（ID、URL、类型、二维码）
      taskStatus: 'SUCCEEDED', // 豆包API是同步返回，直接成功
      imageUrl: imageUrl, // 生成的图片URL
      requestId: response.data.created?.toString() || null,
      submitTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      model: model, // 保存使用的模型
      prompt: prompt // 保存提示词
    });

    await wearTask.save();

    // 更新模特的current_tryon_image_url字段
    modelPerson.current_tryon_image_url = imageUrl;
    
    // 清空所有衣服字段的值（URL和ID都要清空）
    modelPerson.top_garment = '';
    modelPerson.top_garment_id = '';
    modelPerson.bottom_garment = '';
    modelPerson.bottom_garment_id = '';
    modelPerson.headwear = '';
    modelPerson.headwear_id = '';
    modelPerson.accessories = '';
    modelPerson.accessories_id = '';
    modelPerson.outerwear = '';
    modelPerson.outerwear_id = '';
    modelPerson.bag = '';
    modelPerson.bag_id = '';
    modelPerson.shoes = '';
    modelPerson.shoes_id = '';
    modelPerson.other_clothing = '';
    modelPerson.other_clothing_id = '';
    
    modelPerson.updatedAt = Date.now();
    await modelPerson.save();

    // 异步上传图片到微信云存储（后台任务，不阻塞响应）
    // 使用保存后的taskId来更新记录
    const finalTaskId = wearTask.taskId;
    (async () => {
      try {
        console.log('开始异步下载豆包图片并上传到微信云存储...');
        
        // 1. 下载豆包图片到临时文件
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const filename = `tryon_${userId}_${finalTaskId}.png`;
        const tempFilePath = path.join(tempDir, filename);
        
        // 下载图片（如果是base64，需要解码；如果是URL，直接下载）
        if (doubaoImageUrl.startsWith('data:image/')) {
          // Base64格式，需要解码
          const base64Data = doubaoImageUrl.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(tempFilePath, buffer);
        } else {
          // URL格式，使用axios下载
          const imageResponse = await axios({
            url: doubaoImageUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 10000 // 10秒超时
          });
          fs.writeFileSync(tempFilePath, imageResponse.data);
        }
        
        console.log('豆包图片下载成功，临时文件:', tempFilePath);
        
        // 2. 上传到微信云存储
        const cloudPath = generateCloudPath('tryon', filename);
        const uploadResult = await uploadToWechatCloud(tempFilePath, cloudPath);
        
        // 3. 删除临时文件
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        // 4. 如果上传成功，异步更新数据库中的imageUrl
        if (uploadResult.file_url) {
          console.log('图片上传到微信云存储成功，永久URL:', uploadResult.file_url);
          
          // 异步更新试穿记录的imageUrl
          await Wear.findOneAndUpdate(
            { taskId: finalTaskId },
            { imageUrl: uploadResult.file_url },
            { new: true }
          ).catch(err => console.error('更新试穿记录URL失败:', err));
          
          // 异步更新模特的current_tryon_image_url
          await ModelPerson.findOneAndUpdate(
            { user_id: userId },
            { current_tryon_image_url: uploadResult.file_url }
          ).catch(err => console.error('更新模特试穿URL失败:', err));
        }
      } catch (error) {
        console.error('异步上传图片到微信云存储失败:', error.message);
        // 上传失败不影响主流程，继续使用豆包URL
      }
    })().catch(err => {
      console.error('后台上传任务失败:', err.message);
    });

    // 构建返回的衣服信息（只返回有值的字段）
    const returnedClothes = {};
    clothesInfo.forEach(item => {
      if (item.clothesId || item.clothesUrl) {
        returnedClothes[item.field] = {
          clothesId: item.clothesId || '',
          clothesUrl: item.clothesUrl || '',
          positionType: item.positionType,
          shopQrImageUrl: item.shopQrImageUrl || ''
        };
      }
    });

    return {
      taskId: wearTask.taskId,
      taskStatus: 'SUCCEEDED',
      imageUrl: imageUrl,
      clothes: returnedClothes, // 返回试穿的衣服信息（只包含有值的字段）
      model: response.data.model,
      created: response.data.created,
      usage: response.data.usage,
      message: '试穿图片生成成功'
    };
  } catch (error) {
    // 处理API错误
    if (error.response) {
      const errorData = error.response.data;
      throw new Error(
        errorData?.error?.message || 
        errorData?.message || 
        `API请求失败: ${error.response.status}`
      );
    }
    throw error;
  }
};

// 查询试穿任务结果（豆包API是同步的，直接从数据库查询）
exports.getTaskResult = async (userId, taskId) => {
  try {
    // 从数据库查找任务
    const wearTask = await Wear.findOne({ taskId, userId });
    if (!wearTask) {
      throw new Error('任务不存在或无权访问');
    }

    return {
      taskId: wearTask.taskId,
      taskStatus: wearTask.taskStatus,
      imageUrl: wearTask.imageUrl,
      submitTime: wearTask.submitTime,
      endTime: wearTask.endTime,
      requestId: wearTask.requestId,
      model: wearTask.model,
      prompt: wearTask.prompt
    };
  } catch (error) {
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
      .select('imageUrl endTime clothes topGarmentUrl bottomGarmentUrl taskId createdAt');

    const total = await Wear.countDocuments(query);

    // 格式化返回数据
    const formattedRecords = records.map(record => {
      const result = {
        taskId: record.taskId,
        resultImageUrl: record.imageUrl, // 试穿效果图
        endTime: record.endTime, // 完成时间
        createdAt: record.createdAt // 创建时间
      };
      
      // 如果有新的clothes数组，使用新的格式
      if (record.clothes && record.clothes.length > 0) {
        const clothesData = {};
        record.clothes.forEach(item => {
          if (item.clothesId || item.clothesUrl) {
            clothesData[item.field] = {
              clothesId: item.clothesId || '',
              clothesUrl: item.clothesUrl || '',
              positionType: item.positionType || '',
              shopQrImageUrl: item.shopQrImageUrl || ''
            };
          }
        });
        result.clothes = clothesData;
      } else {
        // 兼容旧数据格式
        result.topGarmentUrl = record.topGarmentUrl || null;
        result.bottomGarmentUrl = record.bottomGarmentUrl || null;
      }
      
      return result;
    });

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
