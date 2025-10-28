@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 PreOrder Pro 简单部署（无需CLI）
echo ========================================
echo.

:menu
echo 请选择操作：
echo.
echo [1] 📦 安装项目依赖
echo [2] 💻 启动本地开发服务器
echo [3] 🚀 部署到 Vercel（推荐）
echo [4] 📤 推送到 GitHub（自动部署）
echo [5] 🧪 测试预购功能
echo [6] 📖 查看文档
echo [7] 退出
echo.
set /p choice=请输入选项 (1-7): 

if "%choice%"=="1" goto install
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto github
if "%choice%"=="5" goto test
if "%choice%"=="6" goto docs
if "%choice%"=="7" goto end
echo 无效选项，请重新选择
goto menu

:install
echo.
echo ========================================
echo 📦 安装项目依赖
echo ========================================
echo.
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ 依赖安装完成！
) else (
    echo.
    echo ❌ 安装失败，请检查错误信息
)
pause
goto menu

:dev
echo.
echo ========================================
echo 💻 启动本地开发服务器
echo ========================================
echo.
echo 启动 Next.js 开发服务器...
echo 访问: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.
npm run dev
pause
goto menu

:vercel
echo.
echo ========================================
echo 🚀 部署到 Vercel
echo ========================================
echo.
echo 检查 Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI 未安装
    echo.
    set /p install_vercel=是否安装 Vercel CLI？(yes/no): 
    if "%install_vercel%"=="yes" (
        echo 正在安装...
        call npm install -g vercel
    ) else (
        echo 取消部署
        pause
        goto menu
    )
)

echo.
echo 检查登录状态...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 需要登录 Vercel
    vercel login
)

echo.
echo 开始部署到生产环境...
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 部署成功！
    echo ========================================
    echo.
    echo 📝 下一步：
    echo 1. 记录部署的 URL
    echo 2. 安装 App 到开发店铺测试
    echo 3. 创建库存为0的商品验证
) else (
    echo.
    echo ❌ 部署失败，请检查错误信息
)
pause
goto menu

:github
echo.
echo ========================================
echo 📤 推送到 GitHub（自动部署）
echo ========================================
echo.
echo 这将执行以下操作：
echo 1. git add .
echo 2. git commit
echo 3. git push origin main
echo 4. Vercel 自动检测并部署
echo.
set /p confirm=确认继续？(yes/no): 

if not "%confirm%"=="yes" (
    echo 取消推送
    pause
    goto menu
)

echo.
echo [1/3] 添加所有文件...
git add .

echo.
echo [2/3] 提交更改...
set /p commit_msg=请输入提交信息（直接回车使用默认）: 
if "%commit_msg%"=="" (
    set commit_msg=修复：库存为0时预购按钮不显示
)
git commit -m "%commit_msg%"

echo.
echo [3/3] 推送到 GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 推送成功！
    echo ========================================
    echo.
    echo 📝 Vercel 会自动检测并部署
    echo 📝 访问 https://vercel.com/dashboard 查看部署状态
) else (
    echo.
    echo ❌ 推送失败，请检查错误信息
)
pause
goto menu

:test
echo.
echo ========================================
echo 🧪 测试预购功能
echo ========================================
echo.
echo 测试步骤：
echo.
echo 1. 确保已部署到 Vercel
echo 2. 安装 App 到开发店铺
echo    访问: https://shopmall.dpdns.org/api/auth/shopify?shop=你的店铺.myshopify.com
echo.
echo 3. 创建测试商品
echo    - Products → Add product
echo    - 设置库存为 0
echo    - Save
echo.
echo 4. 访问商品页面
echo    - 应该看到预购按钮（橙色渐变）
echo    - 应该看到预购徽章（图片右上角）
echo.
echo 5. 打开浏览器控制台（F12）
echo    - 应该看到成功日志
echo    - 无错误信息
echo.
echo 按任意键返回菜单...
pause >nul
goto menu

:docs
echo.
echo ========================================
echo 📖 文档
echo ========================================
echo.
echo 可用文档：
echo.
echo 1. 无需CLI的部署方案.md ⭐ - 推荐阅读
echo 2. 开始使用.md - 快速开始
echo 3. 本地开发和部署指南.md - 完整指南
echo 4. 修复说明_中文.md - Bug 修复说明
echo.
echo 按任意键返回菜单...
pause >nul
goto menu

:end
echo.
echo ========================================
echo 📋 快速参考
echo ========================================
echo.
echo 部署方式：
echo   方式1: git push origin main（推荐）
echo   方式2: vercel --prod
echo.
echo 测试地址：
echo   https://shopmall.dpdns.org/api/auth/shopify?shop=你的店铺.myshopify.com
echo.
echo 文档：
echo   无需CLI的部署方案.md
echo.
echo ✅ 不需要 Shopify CLI
echo ✅ 脚本自动注入
echo ✅ 功能完全正常
echo.
echo 👋 再见！
exit /b 0
