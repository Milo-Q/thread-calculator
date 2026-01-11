# 缝纫线计算器

根据订单信息自动计算所需缝纫线的数量和金额的Web应用。

## 技术栈

- **前端**: React + TypeScript + Vite
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma

## 项目结构

```
thread-calculator/
├── client/          # 前端应用
├── server/          # 后端API服务
├── prisma/          # 数据库配置和迁移
├── PRD.md          # 产品需求文档
└── README.md       # 项目说明
```

## 快速开始

详细的安装说明请查看 [INSTALL.md](./INSTALL.md)

### 1. 安装依赖

```bash
# 安装所有依赖（前后端）
npm run install:all

# 或手动安装
npm install
cd server && npm install
cd ../client && npm install
```

### 2. 初始化数据库

```bash
cd server

# 生成Prisma客户端
npm run prisma:generate

# 创建数据库迁移
npm run prisma:migrate

# 初始化初始数据（服装种类）
npm run init:data
```

### 3. 启动开发服务器

```bash
# 在项目根目录，同时启动前后端（推荐）
npm run dev

# 或分别启动
npm run dev:server  # 后端服务 http://localhost:3000
npm run dev:client  # 前端应用 http://localhost:5173
```

### 4. 访问应用

- 前端应用: http://localhost:5173
- 后端API: http://localhost:3000
- API健康检查: http://localhost:3000/api/health

## 功能特性

- ✅ 订单信息管理（服装种类、属性、颜色、备注）
- ✅ 原料信息配置（多线种类支持）
- ✅ 订单详情管理（多颜色、多数量）
- ✅ 测量数据输入（6种工艺）
- ✅ 自动计算（单件用量、需要线数量、采购金额、线费）
- ✅ 采购数量表格（按工艺分组，向上取整）
- ✅ 订单历史查询和编辑
- ✅ 服装种类管理（独立管理界面）
- ✅ 颜色管理（主界面直接操作）
- ✅ 数据导出Excel功能

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 开发说明

详细的产品需求请查看 [PRD.md](./PRD.md)

