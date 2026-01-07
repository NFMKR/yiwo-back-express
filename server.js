require('dotenv').config(); // 加载环境变量
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const routes = require('./src/routes'); // 路由
const { connectDB } = require('./src/config'); // 数据库配置

const app = express();

// 连接数据库
connectDB();

// 中间件配置
app.use(morgan('dev'));  // HTTP 请求日志
app.use(cors());         // 跨域
app.use(helmet());       // 安全头部
app.use(bodyParser.json()); // 解析 JSON 请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 路由配置
app.use('/api', routes);  // 路由前缀为 /api

// 启动服务器
const port = process.env.PORT || 5002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`mongodb ${process.env.MONGODB_URI}`)
});