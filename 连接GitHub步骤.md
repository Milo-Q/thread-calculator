# 连接GitHub步骤（详细版）

现在您需要将代码推送到GitHub，然后才能部署到云端。

---

## 📋 第一步：创建GitHub仓库

### 1.1 打开浏览器

1. 打开浏览器（Chrome、Safari、Firefox等）

2. 访问GitHub创建页面：
   ```
   https://github.com/new
   ```

3. **如果没有GitHub账号**：
   - 点击页面右上角的 **"Sign up"** 或 **"注册"**
   - 使用邮箱注册（免费）
   - 完成注册后回到 https://github.com/new

### 1.2 创建新仓库

在创建页面填写以下信息：

1. **Repository name**（仓库名称）：
   - 输入：`thread-calculator`
   - 或您喜欢的其他名称

2. **Description**（描述，可选）：
   - 输入：`缝纫线计算器`

3. **Public / Private**：
   - 选择 **Public**（公开，免费）
   - 或 **Private**（私有，也是免费的）

4. **⚠️ 重要：不要勾选以下选项**：
   - ❌ **Add a README file**（不要勾选）
   - ❌ **Add .gitignore**（不要勾选）
   - ❌ **Choose a license**（不要勾选）

5. 点击绿色的 **"Create repository"** 按钮

### 1.3 获取您的用户名

创建仓库后，注意浏览器地址栏中的URL，格式类似：
```
https://github.com/YOUR_USERNAME/thread-calculator
```

**记下 `YOUR_USERNAME` 部分**，这就是您的GitHub用户名！

例如，如果URL是 `https://github.com/zhuanz/thread-calculator`，那么您的用户名就是 `zhuanz`。

---

## 📋 第二步：在终端中连接GitHub仓库

### 2.1 回到终端

回到您刚才打开的终端窗口（应该还在项目目录中）。

### 2.2 添加远程仓库

在终端中执行以下命令（**请将 YOUR_USERNAME 替换为您的GitHub用户名**）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/thread-calculator.git
```

**示例**：
- 如果您的用户名是 `zhuanz`，仓库名是 `thread-calculator`，则命令是：
  ```bash
  git remote add origin https://github.com/zhuanz/thread-calculator.git
  ```

- 如果您的用户名是 `john`，仓库名是 `thread-calculator`，则命令是：
  ```bash
  git remote add origin https://github.com/john/thread-calculator.git
  ```

**注意**：
- `YOUR_USERNAME` → 替换为您的GitHub用户名
- `thread-calculator` → 如果您的仓库名不同，也要相应修改
- 整个URL后面要加上 `.git`

### 2.3 确认命令执行成功

按回车执行后，**不应该有任何输出**（没有输出就是成功）。

如果出现错误：
- `fatal: remote origin already exists` → 说明已经连接过，可以跳过
- 其他错误 → 检查用户名和仓库名是否正确

---

## 📋 第三步：推送代码到GitHub

### 3.1 设置分支名称

在终端中执行：

```bash
git branch -M main
```

按回车执行。

**预期结果**：没有输出（正常）

### 3.2 推送到GitHub

在终端中执行：

```bash
git push -u origin main
```

按回车执行。

### 3.3 处理认证（如果需要）

**如果提示输入用户名和密码**：

1. **Username**（用户名）：输入您的GitHub用户名
2. **Password**（密码）：**⚠️ 注意**：
   - 如果您的GitHub账号启用了双因素认证（2FA），不能直接使用密码
   - 需要使用 **Personal Access Token**（个人访问令牌）

**如果提示密码认证失败，需要创建Personal Access Token**：

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 填写信息：
   - **Note**（备注）：输入 `railway-deployment` 或任意名称
   - **Expiration**（过期时间）：选择 `90 days` 或 `No expiration`
   - **Scopes**（权限）：勾选 `repo`（会同时选中所有子权限）
4. 点击 **"Generate token"**
5. **⚠️ 重要**：复制显示的token（只显示一次，需要立即复制）
6. 回到终端，当提示输入密码时，**粘贴这个token**（不是输入密码）

**如果推送成功**，您会看到类似以下的输出：
```
Enumerating objects: 59, done.
Counting objects: 100% (59/59), done.
Delta compression using up to 8 threads
Compressing objects: 100% (57/57), done.
Writing objects: 100% (59/59), done.
Total 59 (delta 3), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (3/3), done.
To https://github.com/YOUR_USERNAME/thread-calculator.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ 验证推送成功

### 方法一：在GitHub网页查看

1. 打开浏览器
2. 访问您的仓库URL：`https://github.com/YOUR_USERNAME/thread-calculator`
3. 您应该能看到所有代码文件

### 方法二：在终端检查

在终端执行：

```bash
git remote -v
```

**预期结果**：应该显示GitHub的URL，类似：
```
origin  https://github.com/YOUR_USERNAME/thread-calculator.git (fetch)
origin  https://github.com/YOUR_USERNAME/thread-calculator.git (push)
```

---

## 🎯 下一步

代码推送到GitHub后，您就可以开始部署了！

下一步是：
1. 注册Vercel账号（前端部署）
2. 注册Railway账号（后端+数据库部署）
3. 开始部署

详细步骤请查看 `完整操作指南.md` 文件中的"第六步"开始的部分。

---

## ❓ 遇到问题？

如果在推送代码时遇到问题，请告诉我：
1. 执行到哪一步了
2. 具体的错误信息（完整复制终端显示的错误）
3. 您的GitHub用户名（用于我帮您检查命令是否正确）

我会帮您解决！

