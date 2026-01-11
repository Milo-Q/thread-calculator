# 第三步：在Railway部署后端和数据库

## ✅ 前置步骤完成

- ✅ Railway账号已注册
- ✅ Vercel账号已注册

---

## 📋 操作步骤

### 步骤1：创建新项目

1. **登录Railway**
   - 访问：https://railway.app
   - 如果还没登录，点击 "Login" 登录

2. **创建新项目**
   - 点击页面上的 **"+ New Project"** 按钮
   - 选择 **"Deploy from GitHub repo"**

3. **授权Railway访问GitHub**（如果第一次使用）
   - 会跳转到GitHub授权页面
   - 点击绿色的 **"Authorize Railway"** 按钮

4. **选择仓库**
   - 在仓库列表中找到 **`Milo-Q/thread-calculator`**
   - 点击仓库名称

---

### 步骤2：添加PostgreSQL数据库

1. **在Railway项目页面**，点击 **"+ New"** 按钮（通常在页面下方）

2. **选择数据库**
   - 选择 **"Database"** → **"Add PostgreSQL"**

3. **等待数据库创建**
   - Railway会自动创建PostgreSQL数据库
   - 等待约1-2分钟，直到显示 "Deployed"

---

### 步骤3：配置后端服务

Railway应该已经自动检测到您的代码并创建了一个服务。

1. **找到后端服务**
   - 在项目页面，应该能看到一个服务（通常显示为您的仓库名）
   - 点击这个服务进入详情页

2. **配置服务设置**（如果需要）
   - 点击 **"Settings"** 标签页
   - 检查以下配置：
     - **Root Directory**：应该设置为 `server`（如果没有，手动设置）
     - **Build Command**：`npm install && npm run build`（如果没有，手动设置）
     - **Start Command**：`npm start`（如果没有，手动设置）

3. **如果Railway没有自动创建服务**：
   - 点击 **"+ New"** → **"GitHub Repo"**
   - 选择 `Milo-Q/thread-calculator`
   - 在设置中设置 **Root Directory** 为 `server`

---

### 步骤4：配置环境变量

1. **在后端服务页面**，点击 **"Variables"** 标签页

2. **添加环境变量**：
   
   点击 **"+ New Variable"** 添加以下变量：

   **变量1：**
   - **Name**：`PORT`
   - **Value**：`3000`
   - 点击 **"Add"**

   **变量2：**
   - **Name**：`NODE_ENV`
   - **Value**：`production`
   - 点击 **"Add"**

   **变量3：**
   - **Name**：`CORS_ORIGIN`
   - **Value**：`https://placeholder.vercel.app`
   - 点击 **"Add"**
   - **⚠️ 注意**：这个值后面部署完前端后需要修改为实际的前端URL

3. **DATABASE_URL（重要）**：
   - **⚠️ 不需要手动添加！**
   - Railway会自动从PostgreSQL数据库服务中获取
   - 会自动注入到后端服务中

---

### 步骤5：等待部署完成

1. **查看部署状态**
   - 点击 **"Deployments"** 标签页
   - 等待部署完成（通常3-5分钟）
   - 部署成功后，状态会显示为 "Active"

2. **获取后端URL**
   - 部署完成后，点击 **"Settings"** 标签页
   - 找到 **"Generate Domain"** 按钮，点击它
   - Railway会生成一个URL，例如：`https://thread-calculator-production.up.railway.app`
   - **⚠️ 重要**：**记下这个URL**，后面部署前端时需要用到！

---

## ✅ 完成标志

- [ ] Railway项目已创建
- [ ] PostgreSQL数据库已添加
- [ ] 后端服务已配置
- [ ] 环境变量已设置
- [ ] 后端服务已部署成功
- [ ] 已获取后端URL

---

## 🎯 下一步

部署完成后，我会指导您：
1. 运行数据库迁移
2. 在Vercel部署前端
3. 更新CORS配置
4. 测试访问

---

## ❓ 如果遇到问题

如果在部署过程中遇到问题，请告诉我：
1. 执行到哪一步了？
2. 具体的错误信息或截图
3. Railway页面显示什么？

我会帮您解决！

---

## 📝 现在请执行

**现在请在Railway创建项目并部署后端**

完成后告诉我：
1. 是否成功创建了项目？
2. 是否添加了数据库？
3. 后端是否部署成功？
4. 后端URL是什么？

我会继续指导下一步！

