const express = require('express');
const router = express.Router();

// 控制器示例
const { getUsers } = require('../controllers/userController');

// 路由定义
router.get('/users', getUsers);

module.exports = router;