@echo off
REM 缝纫线计算器启动脚本 (Windows)

echo ==========================================
echo   缝纫线计算器 - 启动脚本
echo ==========================================
echo.

REM 检查Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误：未找到Node.js
    echo 请确保Node.js已安装并在PATH中
    pause
    exit /b 1
)

REM 检查npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误：未找到npm
    echo 请确保npm已安装并在PATH中
    pause
    exit /b 1
)

echo Node.js版本:
node -v
echo npm版本:
npm -v
echo.

REM 检查必要的目录
if not exist "server" (
    echo 错误：找不到server目录
    echo 请确保您在项目根目录中运行此脚本
    pause
    exit /b 1
)

if not exist "client" (
    echo 错误：找不到client目录
    echo 请确保您在项目根目录中运行此脚本
    pause
    exit /b 1
)

REM 检查数据库
if not exist "server\dev.db" (
    echo 警告：数据库文件不存在
    echo 正在初始化数据库...
    cd server
    call npm run prisma:generate
    call npm run prisma:migrate
    call npm run init:data
    cd ..
    echo 数据库初始化完成
    echo.
)

echo 正在启动应用...
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3000
echo.
echo 提示：关闭此窗口将停止应用
echo 按 Ctrl+C 可以停止应用
echo.
echo ==========================================
echo.

REM 启动应用
call npm run dev

pause

