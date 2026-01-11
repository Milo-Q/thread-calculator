#!/bin/bash
# 缝纫线计算器启动脚本

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 修复PATH环境变量（确保能找到node和npm）
export PATH="/usr/local/bin:$PATH"

echo "=========================================="
echo "  缝纫线计算器 - 启动脚本"
echo "=========================================="
echo ""

# 检查Node.js是否可用
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js"
    echo "请确保Node.js已安装并在PATH中"
    exit 1
fi

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到npm"
    echo "请确保npm已安装并在PATH中"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"
echo "✅ npm版本: $(npm -v)"
echo ""

# 检查必要的目录是否存在
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ 错误：找不到server或client目录"
    echo "请确保您在项目根目录中运行此脚本"
    exit 1
fi

# 检查数据库是否存在
if [ ! -f "server/dev.db" ]; then
    echo "⚠️  警告：数据库文件不存在"
    echo "正在初始化数据库..."
    cd server
    npm run prisma:generate
    npm run prisma:migrate
    npm run init:data
    cd ..
    echo "✅ 数据库初始化完成"
    echo ""
fi

echo "正在启动应用..."
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:3000"
echo ""
echo "提示：关闭此窗口将停止应用"
echo "按 Ctrl+C 可以停止应用"
echo ""
echo "=========================================="
echo ""

# 启动应用（同时启动前后端）
npm run dev

