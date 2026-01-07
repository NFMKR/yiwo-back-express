# Yiwo Back Express - AI试穿服务后端

一个基于 Express.js 的 AI 试穿服务后端应用，集成了用户管理和阿里云 DashScope AI 试穿功能。

## 项目结构

```
yiwo-back-express/
│
├── node_modules/          # 依赖包
├── src/                   # 源代码目录
│   ├── config/            # 配置文件（数据库配置、JWT配置等）
│   ├── controllers/       # 控制器（API 逻辑处理）
│   │   ├── userController.js
│   │   └── wearController.js
│   ├── middlewares/       # 中间件（认证、授权等）
│   │   └── authMiddleware.js
│   ├── models/            # 数据模型（MongoDB模型）
│   │   ├── userModel.js
│   │   └── ai_wear/
│   │       └── wearModel.js
│   ├── routes/            # 路由
│   │   └── index.js
│   ├── services/          # 服务层（业务逻辑）
│   │   ├── userService.js
│   │   └── wearService.js
│   └── utils/             # 工具类（通用函数）
│
├── .env                   # 环境变量配置（需自行创建）
├── .env.example           # 环境变量配置示例
├── server.js              # 入口文件
├── package.json           # npm 配置
├── API_DOCUMENTATION.md   # API接口文档
└── README.md              # 项目说明文档
```

## 功能特性

### 用户模块
- ✅ 用户注册
- ✅ 用户登录
- ✅ 用户退出
- ✅ 获取用户信息
- ✅ JWT Token 认证

### AI试穿模块
- ✅ 创建AI试穿任务
- ✅ 查询试穿任务结果
- ✅ 获取用户所有试穿任务
- ✅ 测试接口（使用默认值）
- ✅ 集成阿里云 DashScope API

## 技术栈

- **框架**: Express.js 5.x
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **HTTP客户端**: axios
- **其他**: cors, helmet, morgan, dotenv

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的配置：

```env
# 服务器配置
PORT=5002

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/yiwo-back-express

# JWT密钥配置（生产环境请使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 阿里云DashScope API配置
DASHSCOPE_API_KEY=your-dashscope-api-key-here
```

### 3. 启动 MongoDB

确保 MongoDB 服务已启动并运行在默认端口 27017。

### 4. 启动服务

开发模式（带热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将运行在 `http://localhost:5002`

## API 接口

详细的 API 文档请查看 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 主要接口列表

#### 用户模块
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `POST /api/users/logout` - 用户退出（需认证）
- `GET /api/users/me` - 获取用户信息（需认证）
- `GET /api/users` - 获取所有用户（需认证）

#### AI试穿模块
- `POST /api/wear/try-on` - 创建试穿任务（需认证）
- `POST /api/wear/try-on/test` - 创建测试任务（需认证）
- `GET /api/wear/tasks/:taskId` - 查询任务结果（需认证）
- `GET /api/wear/tasks` - 获取用户所有任务（需认证）

#### 健康检查
- `GET /api/health` - 健康检查

## 使用示例

### 1. 用户注册和登录

```bash
# 注册
curl -X POST http://localhost:5002/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "password": "123456"
  }'

# 登录
curl -X POST http://localhost:5002/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhangsan@example.com",
    "password": "123456"
  }'
```

### 2. 创建AI试穿任务

```bash
# 使用默认测试数据
curl -X POST http://localhost:5002/api/wear/try-on/test \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 使用自定义数据
curl -X POST http://localhost:5002/api/wear/try-on \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "person_image_url": "https://example.com/person.jpg",
    "top_garment_url": "https://example.com/top.jpg",
    "bottom_garment_url": "https://example.com/bottom.jpg"
  }'
```

### 3. 查询任务结果

```bash
curl -X GET http://localhost:5002/api/wear/tasks/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 开发说明

### 认证机制

所有受保护的接口都需要在请求头中携带 JWT Token：

```
Authorization: Bearer {token}
```

Token 在用户登录后获得，有效期为 7 天。用户退出后 Token 立即失效。

### 数据库模型

#### User 模型
- name: 用户名
- email: 邮箱（唯一）
- password: 密码（加密存储）
- token: JWT Token
- createdAt: 创建时间
- updatedAt: 更新时间

#### Wear 模型
- userId: 用户ID
- taskId: 任务ID（阿里云返回）
- personImageUrl: 模特图片URL
- topGarmentUrl: 上装图片URL
- bottomGarmentUrl: 下装图片URL
- taskStatus: 任务状态
- imageUrl: 结果图片URL
- 其他字段...

## 注意事项

1. **环境变量**：请确保 `.env` 文件中的配置正确，特别是 `DASHSCOPE_API_KEY`

2. **图片要求**：
   - 大小: 5KB ≤ 图像文件 ≤ 5M
   - 边长: 150 ≤ 图像边长 ≤ 4096
   - 格式: jpg、png、jpeg、bmp、heic
   - 必须使用公网可访问的 HTTP/HTTPS 链接

3. **任务轮询**：AI 试穿任务通常需要 15-30 秒完成，建议每 3-5 秒查询一次任务状态

4. **结果有效期**：任务结果和图片 URL 仅保留 24 小时

5. **生产部署**：部署到生产环境前，请务必修改 `JWT_SECRET` 为强密钥

## 常见问题

### Q: MongoDB 连接失败？
A: 请确保 MongoDB 服务已启动，并检查 `.env` 中的 `MONGODB_URI` 配置是否正确。

### Q: API 请求返回 401 错误？
A: 请检查：
- 是否携带了有效的 Token
- Token 格式是否正确（Bearer {token}）
- Token 是否已过期或被注销

### Q: AI 试穿任务一直处于 PENDING 状态？
A: 请检查：
- `DASHSCOPE_API_KEY` 是否配置正确
- 图片 URL 是否可访问
- 阿里云 API 服务是否正常

## License

MIT