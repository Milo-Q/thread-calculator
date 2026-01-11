# 修复DATABASE_URL和Schema问题

## ⚠️ 发现的问题

从错误日志看，有两个问题：

1. **DATABASE_URL未找到**：thread-calculator服务没有引用Postgres的DATABASE_URL
2. **Schema配置错误**：Prisma schema还在使用SQLite，需要改为PostgreSQL

---

## 🔧 解决方案

### 步骤1：添加DATABASE_URL变量引用

1. **在Railway中**，点击 **"thread-calculator"** 服务卡片
2. **点击 "Variables" 标签页**
3. **点击 "+ New Variable" 按钮**
4. **添加变量引用**：
   - **VARIABLE_NAME**：`DATABASE_URL`
   - **VALUE or ${{REF}}**：点击 **"Add Reference"** 按钮
   - 在下拉菜单中选择 **"Postgres"** → **"DATABASE_URL"**
   - 或者直接输入：`${{Postgres.DATABASE_URL}}`
5. **点击 "Add" 按钮**

---

### 步骤2：修改Prisma Schema（重要！）

Prisma schema还在使用SQLite，需要改为PostgreSQL。

#### 2.1 在本地修改文件

在您的代码编辑器中，打开：
- `server/prisma/schema.prisma`

#### 2.2 修改datasource配置

找到这一行：
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

修改为：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2.3 提交并推送更改

1. **在GitHub Desktop中**：
   - 应该能看到 `server/prisma/schema.prisma` 文件已修改
   - 填写提交信息：`修改Prisma schema为PostgreSQL`
   - 点击 "Commit to main"
   - 点击 "Push origin"

2. **Railway会自动重新部署**（通常几分钟内）

---

### 步骤3：添加其他环境变量

如果还没有添加，继续添加：

1. **PORT** = `3000`
2. **NODE_ENV** = `production`
3. **CORS_ORIGIN** = `https://placeholder.vercel.app`

---

### 步骤4：等待重新部署

1. **Railway会自动检测到代码更改**
2. **自动重新部署**（通常3-5分钟）
3. **查看部署日志**，确认没有错误

---

## ✅ 预期结果

修复后：
- DATABASE_URL错误应该消失
- Prisma应该能连接到PostgreSQL数据库
- 服务应该正常运行

---

## 🎯 下一步

部署成功后，我会指导您：
1. 运行数据库迁移
2. 获取后端URL
3. 在Vercel部署前端

---

## ❓ 如果遇到问题

如果在操作过程中遇到问题，请告诉我：
1. 是否成功添加了DATABASE_URL变量引用？
2. 是否修改了schema.prisma文件？
3. 是否推送了代码更改？
4. 重新部署后是否还有错误？

我会继续帮您解决！

