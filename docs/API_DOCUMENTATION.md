# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:5002/api`
- **认证方式**: Bearer Token (JWT)

## 目录

1. [用户模块](#用户模块)
2. [AI试穿模块](#AI试穿模块)

---

## 用户模块

### 1. 用户注册

**接口**: `POST /api/users/register`

**请求头**: 无需认证

**请求体**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "张三",
      "email": "zhangsan@example.com",
      "createdAt": "2025-01-07T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. 用户登录

**接口**: `POST /api/users/login`

**请求头**: 无需认证

**请求体**:
```json
{
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "张三",
      "email": "zhangsan@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. 用户退出

**接口**: `POST /api/users/logout`

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "success": true,
  "message": "退出成功",
  "data": {
    "message": "退出成功"
  }
}
```

---

### 4. 获取当前用户信息

**接口**: `GET /api/users/me`

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2025-01-07T10:00:00.000Z",
    "updatedAt": "2025-01-07T10:00:00.000Z"
  }
}
```

---

### 5. 获取所有用户

**接口**: `GET /api/users`

**请求头**: 
```
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "success": true,
  "message": "获取用户列表成功",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "张三",
      "email": "zhangsan@example.com",
      "createdAt": "2025-01-07T10:00:00.000Z"
    }
  ]
}
```

---

## AI试穿模块

### 1. 创建AI试穿任务

**接口**: `POST /api/wear/try-on`

**请求头**: 
```
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "person_image_url": "https://example.com/person.jpg",
  "top_garment_url": "https://example.com/top.jpg",
  "bottom_garment_url": "https://example.com/bottom.jpg",
  "resolution": -1,
  "restore_face": true
}
```

**参数说明**:
- `person_image_url` (必填): 模特图片URL
- `top_garment_url` (可选): 上装图片URL
- `bottom_garment_url` (可选): 下装图片URL
- `resolution` (可选): 输出分辨率 (-1: 默认, 1024, 1280)
- `restore_face` (可选): 是否还原人脸 (默认: true)

**注意**: `top_garment_url` 和 `bottom_garment_url` 至少需要提供一个

**响应示例**:
```json
{
  "success": true,
  "message": "试穿任务创建成功",
  "data": {
    "taskId": "0385dc79-5ff8-4d82-bcb6-xxxxxx",
    "taskStatus": "PENDING",
    "requestId": "4909100c-7b5a-9f92-bfe5-xxxxxx",
    "message": "任务创建成功"
  }
}
```

---

### 2. 创建测试任务（使用默认值）

**接口**: `POST /api/wear/try-on/test`

**请求头**: 
```
Authorization: Bearer {token}
```

**说明**: 使用文档中提供的默认图片创建测试任务，无需提供任何参数

**响应示例**:
```json
{
  "success": true,
  "message": "测试任务创建成功",
  "data": {
    "taskId": "0385dc79-5ff8-4d82-bcb6-xxxxxx",
    "taskStatus": "PENDING",
    "requestId": "4909100c-7b5a-9f92-bfe5-xxxxxx",
    "message": "任务创建成功"
  }
}
```

---

### 3. 查询试穿任务结果

**接口**: `GET /api/wear/tasks/:taskId`

**请求头**: 
```
Authorization: Bearer {token}
```

**URL参数**:
- `taskId`: 任务ID

**响应示例（任务进行中）**:
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "taskId": "0385dc79-5ff8-4d82-bcb6-xxxxxx",
    "taskStatus": "RUNNING",
    "submitTime": "2025-01-07 14:37:53.838",
    "scheduledTime": "2025-01-07 14:37:53.858",
    "requestId": "98d46cd0-1f90-9231-9a6c-xxxxxx"
  }
}
```

**响应示例（任务完成）**:
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "taskId": "0385dc79-5ff8-4d82-bcb6-xxxxxx",
    "taskStatus": "SUCCEEDED",
    "imageUrl": "http://dashscope-result-hz.oss-cn-hangzhou.aliyuncs.com/tryon.jpg?Expires=xxx",
    "submitTime": "2025-01-07 14:37:53.838",
    "scheduledTime": "2025-01-07 14:37:53.858",
    "endTime": "2025-01-07 14:38:11.472",
    "requestId": "98d46cd0-1f90-9231-9a6c-xxxxxx",
    "message": "任务已完成，图片URL有效期为24小时，请及时下载",
    "usage": {
      "image_count": 1
    }
  }
}
```

**任务状态说明**:
- `PENDING`: 排队中
- `PRE-PROCESSING`: 前置处理中
- `RUNNING`: 处理中
- `POST-PROCESSING`: 后置处理中
- `SUCCEEDED`: 成功
- `FAILED`: 失败
- `UNKNOWN`: 作业不存在或状态未知
- `CANCELED`: 任务取消成功

---

### 4. 获取用户所有试穿任务

**接口**: `GET /api/wear/tasks`

**请求头**: 
```
Authorization: Bearer {token}
```

**查询参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10
- `status` (可选): 任务状态筛选

**示例**: `GET /api/wear/tasks?page=1&limit=10&status=SUCCEEDED`

**响应示例**:
```json
{
  "success": true,
  "message": "获取任务列表成功",
  "data": {
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "taskId": "0385dc79-5ff8-4d82-bcb6-xxxxxx",
        "taskStatus": "SUCCEEDED",
        "personImageUrl": "https://example.com/person.jpg",
        "topGarmentUrl": "https://example.com/top.jpg",
        "bottomGarmentUrl": "https://example.com/bottom.jpg",
        "imageUrl": "http://dashscope-result-hz.oss-cn-hangzhou.aliyuncs.com/tryon.jpg",
        "createdAt": "2025-01-07T10:00:00.000Z",
        "updatedAt": "2025-01-07T10:01:00.000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

## 健康检查

**接口**: `GET /api/health`

**请求头**: 无需认证

**响应示例**:
```json
{
  "success": true,
  "message": "API服务运行正常",
  "timestamp": "2025-01-07T10:00:00.000Z"
}
```

---

## 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "message": "错误信息描述"
}
```

**常见HTTP状态码**:
- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权/认证失败
- `404`: 资源不存在
- `500`: 服务器错误

---

## 使用流程示例

### 1. 用户注册/登录
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
# 使用测试数据创建任务
curl -X POST http://localhost:5002/api/wear/try-on/test \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 或使用自定义数据
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
# 使用返回的taskId查询结果
curl -X GET http://localhost:5002/api/wear/tasks/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. 轮询查询（推荐）
AI试穿任务通常需要15-30秒完成，建议每3-5秒查询一次任务状态，直到状态变为 `SUCCEEDED` 或 `FAILED`。

---

## 注意事项

1. **图片要求**:
   - 大小: 5KB ≤ 图像文件 ≤ 5M
   - 边长: 150 ≤ 图像边长 ≤ 4096
   - 格式: jpg、png、jpeg、bmp、heic
   - 仅支持HTTP/HTTPS链接

2. **任务有效期**: 任务结果仅保留24小时，图片URL也仅24小时有效

3. **轮询建议**: 建议每3-5秒查询一次任务状态

4. **Token管理**: 
   - Token有效期为7天
   - 用户退出后Token立即失效
   - 需要在请求头中携带: `Authorization: Bearer {token}`

