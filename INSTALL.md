# 安装和启动指南

## 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装步骤

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有依赖（前后端）
npm run install:all
```

或者手动安装：

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 初始化数据库

```bash
cd server

# 生成Prisma客户端
npm run prisma:generate
# 或: npx prisma generate --schema=./prisma/schema.prisma

# 创建数据库迁移
npm run prisma:migrate
# 或: npx prisma migrate dev --schema=./prisma/schema.prisma --name init

# 初始化初始数据（服装种类数据）
npm run init:data
```

### 3. 配置环境变量

后端服务器会在 `server/.env` 文件中读取配置（如果不存在会自动创建）。

默认配置：
- PORT: 3000
- DATABASE_URL: file:./dev.db
- CORS_ORIGIN: http://localhost:5173

### 4. 启动开发服务器

#### 方式一：同时启动前后端（推荐）

```bash
# 在项目根目录
npm run dev
```

#### 方式二：分别启动

```bash
# 终端1：启动后端服务
cd server
npm run dev

# 终端2：启动前端应用
cd client
npm run dev
```

### 5. 访问应用

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3000
- API健康检查: http://localhost:3000/api/health

## 数据库管理

### 查看数据库

```bash
cd server
npx prisma studio
```

这会打开Prisma Studio，可以在浏览器中查看和编辑数据库内容。

### 重置数据库

```bash
cd server
# 删除数据库文件
rm prisma/dev.db

# 重新创建数据库
npx prisma migrate dev

# 重新初始化数据
npm run init:data
```

## 生产环境部署

### 构建项目

```bash
# 构建后端
cd server
npm run build

# 构建前端
cd ../client
npm run build
```

### 环境变量配置

在生产环境中，需要设置以下环境变量：

- `DATABASE_URL`: 数据库连接字符串（SQLite或PostgreSQL）
- `PORT`: 服务器端口（默认3000）
- `CORS_ORIGIN`: 前端应用URL
- `NODE_ENV`: 生产环境设置为 `production`

### 使用PostgreSQL（生产环境推荐）

1. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. 设置环境变量：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/thread_calculator"
```

3. 运行迁移：

```bash
npx prisma migrate deploy
```

## 常见问题

### 端口被占用

如果端口3000或5173被占用，可以修改：

- 后端端口：修改 `server/.env` 中的 `PORT`
- 前端端口：修改 `client/vite.config.ts` 中的 `server.port`

### 数据库连接错误

确保：
1. 数据库文件路径正确
2. 有读写权限
3. Prisma客户端已生成（运行 `npx prisma generate`）

### CORS错误

确保前端的代理配置正确，或者后端CORS配置包含前端URL。

