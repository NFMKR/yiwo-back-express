// src/services/modelPersonService.js

const ModelPerson = require('../models/model/modelPersonModel');
const { generateUniqueModelAvatarId } = require('../utils/modelAvatarIdGenerator');
const wechatCloudStorageService = require('./wechatCloudStorageService');
const fs = require('fs');
const path = require('path');

// 创建或更新用户的模特
exports.createOrUpdateUserModel = async (userId, modelData) => {
  try {
    const {
      model_name,
      gender,
      age_stage,
      height,
      weight,
      body_feature,
      suitable_weather,
      shooting_style,
      mood,
      style_preference,
      top_garment,
      top_garment_id,
      bottom_garment,
      bottom_garment_id,
      headwear,
      headwear_id,
      accessories,
      accessories_id,
      outerwear,
      outerwear_id,
      bag,
      bag_id,
      shoes,
      shoes_id,
      other_clothing,
      other_clothing_id,
      description,
      current_avatar_url,
      current_tryon_image_url
    } = modelData;

    // 查找用户是否已有模特
    let model = await ModelPerson.findOne({ user_id: userId });

    if (model) {
      // 更新现有模特（不再自动添加图片到avatar_images）

      // 更新其他字段
      if (model_name !== undefined) model.model_name = model_name;
      if (gender !== undefined) model.gender = gender;
      if (age_stage !== undefined) model.age_stage = age_stage;
      if (height !== undefined) model.height = height;
      if (weight !== undefined) model.weight = weight;
      if (body_feature !== undefined) model.body_feature = body_feature;
      if (suitable_weather !== undefined) model.suitable_weather = suitable_weather;
      if (shooting_style !== undefined) model.shooting_style = shooting_style;
      if (mood !== undefined) model.mood = mood;
      if (style_preference !== undefined) model.style_preference = style_preference;
      if (top_garment !== undefined) model.top_garment = top_garment;
      if (top_garment_id !== undefined) model.top_garment_id = top_garment_id;
      if (bottom_garment !== undefined) model.bottom_garment = bottom_garment;
      if (bottom_garment_id !== undefined) model.bottom_garment_id = bottom_garment_id;
      if (headwear !== undefined) model.headwear = headwear;
      if (headwear_id !== undefined) model.headwear_id = headwear_id;
      if (accessories !== undefined) model.accessories = accessories;
      if (accessories_id !== undefined) model.accessories_id = accessories_id;
      if (outerwear !== undefined) model.outerwear = outerwear;
      if (outerwear_id !== undefined) model.outerwear_id = outerwear_id;
      if (bag !== undefined) model.bag = bag;
      if (bag_id !== undefined) model.bag_id = bag_id;
      if (shoes !== undefined) model.shoes = shoes;
      if (shoes_id !== undefined) model.shoes_id = shoes_id;
      if (other_clothing !== undefined) model.other_clothing = other_clothing;
      if (other_clothing_id !== undefined) model.other_clothing_id = other_clothing_id;
      if (description !== undefined) model.description = description;
      if (current_avatar_url !== undefined) model.current_avatar_url = current_avatar_url;
      if (current_tryon_image_url !== undefined) model.current_tryon_image_url = current_tryon_image_url;

      model.updatedAt = Date.now();
      await model.save();
    } else {
      // 创建新模特（avatar_images留空，由用户自己上传头像）
      // 默认头像URL（用于current_avatar_url，但不添加到avatar_images数组）
      const defaultAvatarUrl = 'https://7072-prod-4g0apka18663bf93-1395010318.tcb.qcloud.la/yiwo-image/model/personavatar3.png';
      
      console.log('创建新模特:', {
        userId: userId.toString(),
        current_avatar_url: current_avatar_url || defaultAvatarUrl
      });
      
      model = new ModelPerson({
        user_id: userId,
        model_name: model_name || '我的模特',
        avatar_images: [], // 留空，用户自己上传头像
        current_avatar_url: current_avatar_url || defaultAvatarUrl, // 使用默认头像或传入的头像URL
        current_tryon_image_url: current_tryon_image_url || '', // 设置当前试穿效果图URL
        gender: gender || null,
        age_stage: age_stage || null,
        height: height || null,
        weight: weight || null,
        body_feature: body_feature || null,
        suitable_weather: suitable_weather || null,
        shooting_style: shooting_style || null,
        mood: mood || null,
        style_preference: style_preference || null,
        top_garment: top_garment || '',
        top_garment_id: top_garment_id || '',
        bottom_garment: bottom_garment || '',
        bottom_garment_id: bottom_garment_id || '',
        headwear: headwear || '',
        headwear_id: headwear_id || '',
        accessories: accessories || '',
        accessories_id: accessories_id || '',
        outerwear: outerwear || '',
        outerwear_id: outerwear_id || '',
        bag: bag || '',
        bag_id: bag_id || '',
        shoes: shoes || '',
        shoes_id: shoes_id || '',
        other_clothing: other_clothing || '',
        other_clothing_id: other_clothing_id || '',
        description: description || '',
        status: '启用' // 确保设置为启用状态
      });

      // 保存模特
      await model.save();
      
      console.log('模特保存成功:', {
        modelId: model._id.toString(),
        userId: model.user_id.toString(),
        status: model.status,
        avatarCount: model.avatar_images.length
      });
    }

    return {
      model: {
        id: model._id,
        user_id: model.user_id,
        model_name: model.model_name,
        avatar_images: model.avatar_images,
        current_avatar_url: model.current_avatar_url,
        current_tryon_image_url: model.current_tryon_image_url,
        gender: model.gender,
        age_stage: model.age_stage,
        height: model.height,
        weight: model.weight,
        body_feature: model.body_feature,
        suitable_weather: model.suitable_weather,
        shooting_style: model.shooting_style,
        mood: model.mood,
        style_preference: model.style_preference,
        top_garment: model.top_garment,
        top_garment_id: model.top_garment_id,
        bottom_garment: model.bottom_garment,
        bottom_garment_id: model.bottom_garment_id,
        headwear: model.headwear,
        headwear_id: model.headwear_id,
        accessories: model.accessories,
        accessories_id: model.accessories_id,
        outerwear: model.outerwear,
        outerwear_id: model.outerwear_id,
        bag: model.bag,
        bag_id: model.bag_id,
        shoes: model.shoes,
        shoes_id: model.shoes_id,
        other_clothing: model.other_clothing,
        other_clothing_id: model.other_clothing_id,
        description: model.description,
        status: model.status,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 获取用户自己的模特
exports.getUserModel = async (userId) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      return {
        model: null,
        message: '用户尚未创建模特'
      };
    }

    // 为缺少 model_avatar_id 的头像自动生成ID
    if (model.avatar_images && model.avatar_images.length > 0) {
      let needsSave = false;
      for (let i = 0; i < model.avatar_images.length; i++) {
        const avatar = model.avatar_images[i];
        // 生成缺失的 model_avatar_id
        if (!avatar.model_avatar_id) {
          avatar.model_avatar_id = await generateUniqueModelAvatarId();
          needsSave = true;
        }
      }
      if (needsSave) {
        await model.save();
      }
    }

    return {
      model: {
        id: model._id,
        user_id: model.user_id,
        model_name: model.model_name,
        avatar_images: model.avatar_images,
        current_avatar_url: model.current_avatar_url,
        current_tryon_image_url: model.current_tryon_image_url,
        gender: model.gender,
        age_stage: model.age_stage,
        height: model.height,
        weight: model.weight,
        body_feature: model.body_feature,
        suitable_weather: model.suitable_weather,
        shooting_style: model.shooting_style,
        mood: model.mood,
        style_preference: model.style_preference,
        top_garment: model.top_garment,
        top_garment_id: model.top_garment_id,
        bottom_garment: model.bottom_garment,
        bottom_garment_id: model.bottom_garment_id,
        headwear: model.headwear,
        headwear_id: model.headwear_id,
        accessories: model.accessories,
        accessories_id: model.accessories_id,
        outerwear: model.outerwear,
        outerwear_id: model.outerwear_id,
        bag: model.bag,
        bag_id: model.bag_id,
        shoes: model.shoes,
        shoes_id: model.shoes_id,
        other_clothing: model.other_clothing,
        other_clothing_id: model.other_clothing_id,
        description: model.description,
        status: model.status,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 更新当前头像
exports.updateCurrentAvatar = async (userId, avatarImagesUrl) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 检查图片是否在avatar_images数组中
    const imageExists = model.avatar_images.some(
      img => img.avatar_images_url === avatarImagesUrl
    );

    if (!imageExists) {
      throw new Error('该图片不在用户的模特图片列表中');
    }

    model.current_avatar_url = avatarImagesUrl;
    model.updatedAt = Date.now();
    await model.save();

    return {
      message: '当前头像更新成功',
      current_avatar_url: model.current_avatar_url
    };
  } catch (error) {
    throw error;
  }
};

// 更新当前试穿效果图
exports.updateCurrentTryonImage = async (userId, tryonImageUrl) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    model.current_tryon_image_url = tryonImageUrl;
    model.updatedAt = Date.now();
    await model.save();

    return {
      message: '试穿效果图更新成功',
      current_tryon_image_url: model.current_tryon_image_url
    };
  } catch (error) {
    throw error;
  }
};

// 删除模特图片（从数组中移除，通过avatar_images_url）
exports.deleteModelImage = async (userId, avatarImagesUrl) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 检查是否是当前头像
    if (model.current_avatar_url === avatarImagesUrl) {
      throw new Error('不能删除当前使用的头像，请先切换其他头像');
    }

    // 从数组中移除
    model.avatar_images = model.avatar_images.filter(
      img => img.avatar_images_url !== avatarImagesUrl
    );

    model.updatedAt = Date.now();
    await model.save();

    return {
      message: '图片删除成功',
      avatar_images: model.avatar_images
    };
  } catch (error) {
    throw error;
  }
};

// 修改模特信息（不包含图片相关字段）
exports.updateModelInfo = async (userId, updateData) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 为缺少 model_avatar_id 的头像自动生成ID
    if (model.avatar_images && model.avatar_images.length > 0) {
      let needsSave = false;
      for (let i = 0; i < model.avatar_images.length; i++) {
        const avatar = model.avatar_images[i];
        // 生成缺失的 model_avatar_id
        if (!avatar.model_avatar_id) {
          avatar.model_avatar_id = await generateUniqueModelAvatarId();
          needsSave = true;
        }
      }
      if (needsSave) {
        await model.save();
      }
    }

    // 允许更新的字段（包含当前头像和试穿效果图URL）
    const allowedFields = [
      'model_name', 'gender', 'age_stage', 'height', 'weight',
      'body_feature', 'suitable_weather', 'shooting_style', 'mood',
      'style_preference', 
      'top_garment', 'top_garment_id', 
      'bottom_garment', 'bottom_garment_id', 
      'headwear', 'headwear_id', 
      'accessories', 'accessories_id', 
      'outerwear', 'outerwear_id', 
      'bag', 'bag_id', 
      'shoes', 'shoes_id', 
      'other_clothing', 'other_clothing_id', 
      'description',
      'current_avatar_url', 'current_tryon_image_url'
    ];

    // 更新字段（允许 undefined、null 和空字符串作为有效值）
    let hasChanges = false;
    const updatedFields = [];
    const ignoredFields = [];

    // 先检查传入的字段
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        // 字段在允许列表中，允许更新（包括 null 和空字符串）
        const oldValue = model[key];
        const newValue = updateData[key];
        
        // 即使值相同也允许更新（因为可能是清空操作）
        model[key] = newValue;
        hasChanges = true;
        updatedFields.push({ field: key, oldValue, newValue });
      } else {
        // 字段不在允许列表中
        ignoredFields.push(key);
      }
    });

    // 添加调试日志
    console.log('更新模特信息:', {
      userId,
      hasChanges,
      updatedFields,
      ignoredFields,
      updateDataKeys: Object.keys(updateData)
    });

    if (!hasChanges) {
      const errorMsg = ignoredFields.length > 0 
        ? `没有需要更新的字段。传入的字段 ${ignoredFields.join(', ')} 不在允许更新的字段列表中。允许的字段: ${allowedFields.join(', ')}`
        : '没有需要更新的字段。请确保传递了有效的字段名。允许的字段: ' + allowedFields.join(', ');
      throw new Error(errorMsg);
    }

    model.updatedAt = Date.now();
    await model.save();

    return {
      message: '模特信息更新成功',
      model: {
        id: model._id,
        model_name: model.model_name,
        gender: model.gender,
        age_stage: model.age_stage,
        height: model.height,
        weight: model.weight,
        body_feature: model.body_feature,
        suitable_weather: model.suitable_weather,
        shooting_style: model.shooting_style,
        mood: model.mood,
        style_preference: model.style_preference,
        top_garment: model.top_garment,
        top_garment_id: model.top_garment_id,
        bottom_garment: model.bottom_garment,
        bottom_garment_id: model.bottom_garment_id,
        headwear: model.headwear,
        headwear_id: model.headwear_id,
        accessories: model.accessories,
        accessories_id: model.accessories_id,
        outerwear: model.outerwear,
        outerwear_id: model.outerwear_id,
        bag: model.bag,
        bag_id: model.bag_id,
        shoes: model.shoes,
        shoes_id: model.shoes_id,
        other_clothing: model.other_clothing,
        other_clothing_id: model.other_clothing_id,
        description: model.description,
        current_avatar_url: model.current_avatar_url,
        current_tryon_image_url: model.current_tryon_image_url,
        updatedAt: model.updatedAt
      }
    };
  } catch (error) {
    throw error;
  }
};

// 上传头像并自动添加到数组（封装上传逻辑）
exports.addModelAvatar = async (userId, file) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特，请先创建模特');
    }

    if (!file) {
      throw new Error('请上传图片文件');
    }

    // 上传文件到微信云存储
    let uploadResult;
    try {
      uploadResult = await wechatCloudStorageService.uploadToWechatCloud(
        file.path,
        `model/avatar/${userId}/${Date.now()}-${file.originalname}`
      );
    } catch (uploadError) {
      // 确保临时文件被删除
      if (fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('删除临时文件失败:', unlinkError);
        }
      }
      throw new Error(`文件上传失败: ${uploadError.message}`);
    }

    // 删除临时文件
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error('删除临时文件失败:', unlinkError);
      }
    }

    if (!uploadResult || !uploadResult.file_url) {
      throw new Error('文件上传失败，无法获取文件URL');
    }

    // 生成唯一的头像ID
    const avatarId = await generateUniqueModelAvatarId();

    // 添加到头像数组
    model.avatar_images.push({
      model_avatar_id: avatarId,
      avatar_images_url: uploadResult.file_url
    });

    // 自动将当前头像设置为新上传的图片
    model.current_avatar_url = uploadResult.file_url;

    model.updatedAt = Date.now();
    await model.save();

    return {
      message: '头像上传并添加成功',
      avatar_images: model.avatar_images.map(avatar => ({
        model_avatar_id: avatar.model_avatar_id,
        avatar_images_url: avatar.avatar_images_url || ''
      })),
      current_avatar_url: model.current_avatar_url
    };
  } catch (error) {
    // 确保临时文件被删除
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error('删除临时文件失败:', unlinkError);
      }
    }
    throw error;
  }
};

// 通过model_avatar_id删除头像
exports.deleteModelAvatarById = async (userId, modelAvatarId) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 查找要删除的头像
    const avatarToDelete = model.avatar_images.find(
      img => img.model_avatar_id === modelAvatarId
    );

    if (!avatarToDelete) {
      throw new Error('未找到指定的头像');
    }

    // 获取头像URL
    const avatarUrl = avatarToDelete.avatar_images_url;

    // 检查是否是当前头像
    if (model.current_avatar_url === avatarUrl) {
      throw new Error('不能删除当前使用的头像，请先切换其他头像');
    }

    // 从数组中移除
    model.avatar_images = model.avatar_images.filter(
      img => img.model_avatar_id !== modelAvatarId
    );

    model.updatedAt = Date.now();
    await model.save();

    return {
      message: '头像删除成功',
      avatar_images: model.avatar_images
    };
  } catch (error) {
    throw error;
  }
};

// 获取模特头像列表
exports.getModelAvatars = async (userId) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 处理头像列表，返回标准格式
    const processedAvatarImages = model.avatar_images.map((avatar) => {
      // 使用 toObject() 方法获取纯对象，避免 Mongoose 文档的复杂性
      const avatarObj = avatar.toObject ? avatar.toObject() : (avatar instanceof Object ? avatar : {});
      
      // 返回标准格式：包含 model_avatar_id 和 avatar_images_url
      return {
        model_avatar_id: avatarObj.model_avatar_id || '',
        avatar_images_url: avatarObj.avatar_images_url || ''
      };
    });

    return {
      message: '获取头像列表成功',
      avatar_images: processedAvatarImages,
      current_avatar_url: model.current_avatar_url
    };
  } catch (error) {
    throw error;
  }
};
