#!/bin/bash
# 修复环境变量脚本

# 将Node.js路径添加到PATH
export PATH="/usr/local/bin:$PATH"

# 验证Node.js和npm
echo "检查Node.js和npm..."
node -v
npm -v

echo ""
echo "环境已修复！现在可以运行安装命令了。"
echo "请输入: npm run install:all"

