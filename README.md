my-express-app/
│
├── node_modules/          # 依赖包
├── src/                   # 源代码目录
│   ├── config/            # 配置文件（.env、数据库配置等）
│   ├── controllers/       # 控制器（API 逻辑处理）
│   ├── middlewares/       # 中间件（验证、授权等）
│   ├── models/            # 数据模型（数据库模型）
│   ├── routes/            # 路由
│   ├── services/          # 服务层（业务逻辑）
│   └── utils/             # 工具类（通用函数）
│
├── .env                   # 环境变量配置
├── .gitignore             # Git 忽略文件
├── server.js              # 入口文件
└── package.json           # npm 配置