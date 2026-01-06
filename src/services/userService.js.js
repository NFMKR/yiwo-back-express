// src/services/userService.js

const User = require('../models/userModel.js');

exports.getAllUsers = async () => {
  return await User.find();
}