# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（生产环境依赖）
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY . .

# 暴露端口（微信云托管会自动映射端口）
# 注意：微信云托管会通过环境变量 PORT 来指定端口
EXPOSE 5002

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "server.js"]

