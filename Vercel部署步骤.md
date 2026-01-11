# Vercel部署前端步骤

## ✅ 后端已就绪

- ✅ 后端URL：`https://thread-calculator-production.up.railway.app`
- ✅ 数据库迁移成功
- ✅ API测试通过

---

## 🚀 步骤1：在Vercel创建项目

1. **访问**：https://vercel.com
2. **登录**您的账号
3. **点击 "Add New..." → "Project"**
4. **选择GitHub仓库**：`Milo-Q/thread-calculator`
5. **点击 "Import"**

---

## ⚙️ 步骤2：配置项目设置

在项目配置页面：

### Root Directory（重要！）

1. **点击 "Root Directory" 旁边的 "Edit"**
2. **选择 `client` 目录**
3. **点击 "Save"**

**说明**：因为前端代码在 `client` 文件夹中，需要告诉Vercel从 `client` 目录构建。

---

### Framework Preset

- 应该自动检测为 **"Vite"**
- 如果没有，手动选择 **"Vite"**

---

### Build Settings

Vercel应该自动检测到以下设置：

- **Build Command**：`npm run build`（在client目录中）
- **Output Directory**：`dist`
- **Install Command**：`npm install`

如果显示不正确，可以手动设置：
- **Build Command**：`npm run build`
- **Output Directory**：`dist`
- **Install Command**：`npm install`

---

## 🔐 步骤3：配置环境变量

在部署之前，添加环境变量：

1. **在项目配置页面，找到 "Environment Variables" 部分**
2. **点击 "Add" 或 "+"**
3. **添加变量**：
   - **Name**：`VITE_API_BASE_URL`
   - **Value**：`https://thread-calculator-production.up.railway.app`
   - **Environment**：选择所有环境（Production、Preview、Development）
4. **点击 "Save"**

**注意**：前端代码使用 `VITE_API_BASE_URL` 环境变量来连接后端。

---

## 🚀 步骤4：部署

1. **检查所有配置是否正确**
2. **点击 "Deploy" 按钮**
3. **等待部署完成**（约2-3分钟）

---

## ✅ 步骤5：获取前端URL

部署完成后：

1. **Vercel会自动生成一个URL**，类似：
   - `thread-calculator-xxxxx.vercel.app`
   - 或您自定义的域名

2. **点击URL访问前端应用**

---

## 🧪 步骤6：测试应用

1. **打开前端URL**
2. **测试功能**：
   - 创建订单
   - 查看订单列表
   - 测试计算功能

3. **如果遇到CORS错误**：
   - 检查后端CORS配置
   - 确保后端允许前端域名访问

---

## 🔧 如果遇到问题

### 问题1：构建失败

**可能原因**：
- Root Directory设置错误
- 依赖安装失败

**解决方法**：
- 确认Root Directory设置为 `client`
- 检查 `client/package.json` 是否存在

### 问题2：API连接失败

**可能原因**：
- 环境变量未正确配置
- CORS配置问题

**解决方法**：
- 检查 `VITE_API_BASE_URL` 环境变量
- 检查后端CORS配置（应该允许Vercel域名）

### 问题3：找不到模块

**可能原因**：
- 依赖未正确安装

**解决方法**：
- 检查构建日志
- 确认 `client/package.json` 中的依赖都正确

---

## 📝 重要提示

1. **Root Directory必须设置为 `client`**，否则Vercel会在项目根目录查找前端代码
2. **环境变量必须在部署前配置**，否则前端无法连接到后端
3. **部署后可能需要几分钟才能完全生效**

---

## 🎯 现在请执行

1. **在Vercel创建项目并连接GitHub仓库**
2. **设置Root Directory为 `client`**
3. **添加环境变量 `VITE_API_BASE_URL`**
4. **点击 "Deploy"**
5. **等待部署完成**
6. **测试前端应用**

如果遇到任何问题，告诉我，我会继续帮您解决！

