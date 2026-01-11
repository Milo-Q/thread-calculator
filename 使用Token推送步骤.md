# 使用Personal Access Token推送代码（详细步骤）

由于多次推送失败，我们使用Personal Access Token来解决认证问题。

---

## 第一步：创建Personal Access Token

### 1.1 打开浏览器

1. 打开浏览器
2. 访问：https://github.com/settings/tokens
3. 如果没有登录，先登录GitHub账号

### 1.2 生成新Token

1. 点击页面上的 **"Generate new token"** 按钮
2. 在下拉菜单中选择 **"Generate new token (classic)"**

### 1.3 填写Token信息

在表单中填写：

1. **Note**（备注）：
   - 输入任意名称，比如：`thread-calculator-deployment`
   - 或：`macbook-push`

2. **Expiration**（过期时间）：
   - 选择 **"90 days"**（90天）
   - 或 **"No expiration"**（永不过期，但不太安全）

3. **Select scopes**（选择权限）：
   - 找到 **"repo"** 部分
   - 勾选 **"repo"**（会自动选中下面的所有子权限）
   - 确保以下权限被选中：
     - ✅ repo
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events

4. 滚动到页面底部

5. 点击绿色的 **"Generate token"** 按钮

### 1.4 复制Token

**⚠️ 重要**：Token只会显示一次！

1. 页面会显示您的Token（一串很长的字符，类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
2. **立即复制**这个Token
3. **保存到安全的地方**（记事本、密码管理器等）

---

## 第二步：在终端中使用Token推送

### 方法A：在推送命令中直接使用Token（推荐，最简单）

在终端中执行以下命令（**将 YOUR_TOKEN 替换为您刚才复制的Token**）：

```bash
git push https://YOUR_TOKEN@github.com/414871700-web/thread-calculator.git main
```

**示例**（如果您的Token是 `ghp_abcdef1234567890`）：
```bash
git push https://ghp_abcdef1234567890@github.com/414871700-web/thread-calculator.git main
```

**⚠️ 注意**：
- 将 `YOUR_TOKEN` 替换为您的实际Token
- Token前面不需要加 `https://`，但URL中需要有
- 整个URL是一个整体，不要有空格

### 方法B：使用Git Credential Helper（推荐，更安全）

#### B1. 配置Git存储凭据

在终端执行：
```bash
git config --global credential.helper osxkeychain
```

（Mac用户使用 `osxkeychain`，Windows用户使用 `wincred`）

#### B2. 执行推送命令

在终端执行：
```bash
git push -u origin main
```

#### B3. 输入凭据

当提示输入用户名时：
- 输入：`414871700-web`
- 按回车

当提示输入密码时：
- **不要输入密码**
- **粘贴您的Personal Access Token**（刚才复制的Token）
- 按回车

---

## 第三步：验证推送成功

推送成功后，您会看到类似以下的输出：

```
Enumerating objects: 62, done.
Counting objects: 100% (62/62), done.
Delta compression using up to 8 threads
Compressing objects: 100% (60/60), done.
Writing objects: 100% (62/62), done.
Total 62 (delta 3), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (3/3), done.
To https://github.com/414871700-web/thread-calculator.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### 在浏览器中验证

1. 打开浏览器
2. 访问：https://github.com/414871700-web/thread-calculator
3. 您应该能看到所有代码文件

---

## 常见问题

### Q1: Token在哪里输入？

**方法A**：直接在URL中使用Token（最简单）
```bash
git push https://YOUR_TOKEN@github.com/414871700-web/thread-calculator.git main
```

**方法B**：当提示输入密码时，粘贴Token（不是输入密码）

### Q2: 还是提示错误怎么办？

1. **检查Token是否正确复制**（不要有多余的空格）
2. **检查用户名是否正确**（`414871700-web`）
3. **检查网络连接**（尝试访问 https://github.com）
4. **稍后再试**（可能是GitHub服务器暂时不可用）

### Q3: Token会显示在终端历史中吗？

**方法A**：会显示在终端历史中（不太安全）
**方法B**：不会显示（更安全）

如果使用方法A，推送成功后，建议清除终端历史或使用新终端。

---

## 推荐使用

**推荐使用方法B**（Git Credential Helper）：
- ✅ 更安全（Token不会显示在命令历史中）
- ✅ 更方便（以后推送不需要再输入Token）
- ✅ 系统会记住您的凭据

---

## 下一步

推送成功后，您就可以开始部署了！

详细部署步骤请查看 `完整操作指南.md` 文件。

