// src/services/modelPersonService.js

const ModelPerson = require('../models/model/modelPersonModel');

// 创建或更新用户的模特（上传图片后创建）
exports.createOrUpdateUserModel = async (userId, modelData) => {
  try {
    const {
      full_body_image_url,
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
      bottom_garment,
      headwear,
      accessories,
      outerwear,
      bag,
      shoes,
      other_clothing,
      description
    } = modelData;

    // 验证必填字段
    if (!full_body_image_url) {
      throw new Error('全身图URL不能为空');
    }

    // 查找用户是否已有模特
    let model = await ModelPerson.findOne({ user_id: userId });

    if (model) {
      // 更新现有模特
      // 将新图片添加到头像数组
      if (full_body_image_url) {
        model.avatar_images.push({
          full_body_image_url
        });
        // 如果当前头像为空，设置为新上传的图片
        if (!model.current_avatar_url) {
          model.current_avatar_url = full_body_image_url;
        }
      }

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
      if (bottom_garment !== undefined) model.bottom_garment = bottom_garment;
      if (headwear !== undefined) model.headwear = headwear;
      if (accessories !== undefined) model.accessories = accessories;
      if (outerwear !== undefined) model.outerwear = outerwear;
      if (bag !== undefined) model.bag = bag;
      if (shoes !== undefined) model.shoes = shoes;
      if (other_clothing !== undefined) model.other_clothing = other_clothing;
      if (description !== undefined) model.description = description;

      model.updatedAt = Date.now();
      await model.save();
    } else {
      // 创建新模特
      model = new ModelPerson({
        user_id: userId,
        model_name: model_name || '',
        avatar_images: [{
          full_body_image_url
        }],
        current_avatar_url: full_body_image_url,
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
        bottom_garment: bottom_garment || '',
        headwear: headwear || '',
        accessories: accessories || '',
        outerwear: outerwear || '',
        bag: bag || '',
        shoes: shoes || '',
        other_clothing: other_clothing || '',
        description: description || '',
        status: '启用'
      });

      await model.save();
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
        bottom_garment: model.bottom_garment,
        headwear: model.headwear,
        accessories: model.accessories,
        outerwear: model.outerwear,
        bag: model.bag,
        shoes: model.shoes,
        other_clothing: model.other_clothing,
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
        bottom_garment: model.bottom_garment,
        headwear: model.headwear,
        accessories: model.accessories,
        outerwear: model.outerwear,
        bag: model.bag,
        shoes: model.shoes,
        other_clothing: model.other_clothing,
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
exports.updateCurrentAvatar = async (userId, fullBodyImageUrl) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 检查图片是否在数组中
    const imageExists = model.avatar_images.some(
      img => img.full_body_image_url === fullBodyImageUrl
    );

    if (!imageExists) {
      throw new Error('该图片不在用户的模特图片列表中');
    }

    model.current_avatar_url = fullBodyImageUrl;
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

// 删除模特图片（从数组中移除）
exports.deleteModelImage = async (userId, fullBodyImageUrl) => {
  try {
    const model = await ModelPerson.findOne({ user_id: userId });

    if (!model) {
      throw new Error('用户尚未创建模特');
    }

    // 检查是否是当前头像
    if (model.current_avatar_url === fullBodyImageUrl) {
      throw new Error('不能删除当前使用的头像，请先切换其他头像');
    }

    // 从数组中移除
    model.avatar_images = model.avatar_images.filter(
      img => img.full_body_image_url !== fullBodyImageUrl
    );

    if (model.avatar_images.length === 0) {
      throw new Error('至少需要保留一张模特图片');
    }

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
