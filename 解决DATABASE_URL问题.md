# 解决DATABASE_URL问题

## ⚠️ 问题说明

从错误日志看：
```
Environment variable not found: DATABASE_URL
```

**问题原因**：
- Postgres数据库已经创建，有自己的`DATABASE_URL`
- 但是thread-calculator服务没有引用Postgres的`DATABASE_URL`
- 需要将Postgres的`DATABASE_URL`作为变量引用添加到thread-calculator服务中

---

## 🔧 解决方案

### 步骤1：进入thread-calculator服务的Variables页面

1. **在Architecture视图中**，点击 **"thread-calculator"** 服务卡片
2. **点击 "Variables" 标签页**

### 步骤2：添加DATABASE_URL变量引用

1. **在Variables页面**，点击 **"+ New Variable"** 按钮

2. **添加变量引用**：
   - **VARIABLE_NAME**：输入 `DATABASE_URL`
   - **VALUE or ${{REF}}**：点击 **"Add Reference"** 按钮（带下拉箭头）
   - 在下拉菜单中选择 **"Postgres"** → **"DATABASE_URL"**
   - 或者直接输入：`${{Postgres.DATABASE_URL}}`

3. **点击 "Add" 按钮**

**⚠️ 重要**：这里使用的是**变量引用**（Reference），不是直接输入值。这样当Postgres的DATABASE_URL变化时，thread-calculator会自动获取新值。

---

### 步骤3：添加其他环境变量

如果还没有添加，继续添加：

1. **PORT** = `3000`
2. **NODE_ENV** = `production`
3. **CORS_ORIGIN** = `https://placeholder.vercel.app`

---

### 步骤4：应用更改并重新部署

1. **回到Architecture视图**
2. **点击 "Apply 3 changes" 按钮**（或 "Deploy ⇧+Enter"）
3. **等待重新部署完成**（约2-3分钟）

---

## ✅ 预期结果

重新部署后：
- 错误应该消失
- 服务应该能正常连接到数据库
- 日志中不再显示 `Environment variable not found: DATABASE_URL`

---

## 🎯 下一步

部署成功后，我会指导您：
1. 运行数据库迁移
2. 获取后端URL
3. 在Vercel部署前端

---

## ❓ 如果遇到问题

如果在添加变量引用时遇到问题，请告诉我：
1. 是否能看到 "Add Reference" 按钮？
2. 在下拉菜单中是否能看到 "Postgres" 选项？
3. 如果有错误，请截图给我看

我会继续帮您解决！

