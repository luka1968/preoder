@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 PreOrder Pro 快速启动
echo ========================================
echo.

:menu
echo 请选择操作：
echo.
echo [1] 🔧 安装所有依赖
echo [2] 💻 启动本地开发服务器
echo [3] 🚀 部署到 Vercel
echo [4] 📦 部署 Shopify 扩展
echo [5] 🧪 完整部署流程
echo [6] 📖 查看文档
echo [7] 退出
echo.
set /p choice=请输入选项 (1-7): 

if "%choice%"=="1" goto install
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto shopify
if "%choice%"=="5" goto full
if "%choice%"=="6" goto docs
if "%choice%"=="7" goto end
echo 无效选项，请重新选择
goto menu

:install
echo.
echo ========================================
echo 📦 安装依赖
echo ========================================
echo.
echo [1/3] 安装项目依赖...
call npm install

echo.
echo [2/3] 检查 Shopify CLI...
where shopify >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Shopify CLI 未安装
    echo 正在安装...
    call npm install -g @shopify/cli @shopify/app
) else (
    echo ✓ Shopify CLI 已安装
)

echo.
echo [3/3] 检查 Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI 未安装
    echo 正在安装...
    call npm install -g vercel
) else (
    echo ✓ Vercel CLI 已安装
)

echo.
echo ========================================
echo ✅ 所有依赖安装完成！
echo ========================================
pause
goto menu

:dev
echo.
echo ========================================
echo 💻 启动本地开发服务器
echo ========================================
echo.
echo 选择启动方式：
echo [1] 使用 npm (Next.js)
echo [2] 使用 Shopify CLI (推荐)
echo [3] 返回
echo.
set /p dev_choice=请选择 (1-3): 

if "%dev_choice%"=="1" (
    echo.
    echo 启动 Next.js 开发服务器...
    echo 访问: http://localhost:3000
    echo.
    npm run dev
) else if "%dev_choice%"=="2" (
    echo.
    echo 启动 Shopify App 开发服务器...
    echo.
    shopify app dev
) else (
    goto menu
)
pause
goto menu

:vercel
echo.
echo ========================================
echo 🚀 部署到 Vercel
echo ========================================
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
    echo ✅ Vercel 部署成功！
    echo ========================================
) else (
    echo.
    echo ❌ 部署失败，请检查错误信息
)
pause
goto menu

:shopify
echo.
echo ========================================
echo 📦 部署 Shopify 扩展
echo ========================================
echo.
echo 检查登录状态...
shopify whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 需要登录 Shopify
    shopify auth login
)

echo.
echo 进入扩展目录...
cd extensions\preorder-embed

echo.
echo 开始部署扩展...
shopify app deploy

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 扩展部署成功！
    echo ========================================
    echo.
    echo 📝 下一步：
    echo 1. 在 Shopify Admin 中启用 App Embed
    echo 2. 创建测试商品（库存=0）
    echo 3. 访问商品页面验证
) else (
    echo.
    echo ❌ 部署失败，请检查错误信息
)

cd ..\..
pause
goto menu

:full
echo.
echo ========================================
echo 🚀 完整部署流程
echo ========================================
echo.
echo 这将执行以下步骤：
echo 1. 部署到 Vercel
echo 2. 部署 Shopify 扩展
echo.
set /p confirm=确认继续？(yes/no): 

if not "%confirm%"=="yes" (
    echo 取消部署
    pause
    goto menu
)

echo.
echo [1/2] 部署到 Vercel...
vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Vercel 部署失败，终止流程
    pause
    goto menu
)

echo.
echo [2/2] 部署 Shopify 扩展...
cd extensions\preorder-embed
shopify app deploy
cd ..\..

echo.
echo ========================================
echo ✅ 完整部署完成！
echo ========================================
echo.
echo 📝 下一步操作：
echo 1. 在 Shopify Admin 启用 App Embed
echo    路径: Online Store → Themes → Customize → App embeds
echo 2. 创建测试商品（库存设为 0）
echo 3. 访问商品页面验证预购按钮
echo 4. 打开浏览器控制台查看日志
echo.
pause
goto menu

:docs
echo.
echo ========================================
echo 📖 文档
echo ========================================
echo.
echo 可用文档：
echo.
echo 1. 本地开发和部署指南.md - 完整开发指南
echo 2. 最终部署说明.md - 部署总结
echo 3. APP_EMBED_安装指南.md - App Embed 详细说明
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
echo 常用命令：
echo   npm run dev          - 启动开发服务器
echo   shopify app dev      - Shopify 开发模式
echo   vercel --prod        - 部署到 Vercel
echo   shopify app deploy   - 部署扩展
echo.
echo 文档：
echo   本地开发和部署指南.md
echo.
echo 👋 再见！
exit /b 0
