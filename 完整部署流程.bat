@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 PreOrder Pro 完整部署流程
echo ========================================
echo.

:menu
echo 请选择部署方式：
echo.
echo [1] 🎯 完整自动部署（推荐）
echo [2] 📦 仅部署 App Embed 扩展
echo [3] 🌐 仅部署到 Vercel
echo [4] 🧪 启动开发模式测试
echo [5] 📊 查看部署状态
echo [6] 退出
echo.
set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto full
if "%choice%"=="2" goto embed
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto dev
if "%choice%"=="5" goto status
if "%choice%"=="6" goto end
echo 无效选项，请重新选择
goto menu

:full
echo.
echo ========================================
echo 🎯 完整自动部署
echo ========================================
echo.
echo 这将执行以下步骤：
echo 1. 检查环境
echo 2. 部署到 Vercel
echo 3. 部署 App Embed 扩展
echo 4. 提供测试指南
echo.
set /p confirm=确认继续？(yes/no): 

if not "%confirm%"=="yes" (
    echo 取消部署
    pause
    goto menu
)

echo.
echo [1/5] 检查 Shopify CLI 登录状态...
shopify whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ 未登录 Shopify CLI
    echo 正在启动登录...
    shopify auth login
    if %errorlevel% neq 0 (
        echo ❌ 登录失败
        pause
        goto menu
    )
)
echo ✅ Shopify CLI 已登录
echo.

echo [2/5] 检查 Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI 未安装
    set /p install_vercel=是否安装 Vercel CLI？(yes/no): 
    if "%install_vercel%"=="yes" (
        npm install -g vercel
    ) else (
        echo 跳过 Vercel 部署
        goto skip_vercel
    )
)

echo 正在部署到 Vercel...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 需要登录 Vercel
    vercel login
)
vercel --prod

if %errorlevel% neq 0 (
    echo ⚠️ Vercel 部署失败，但继续部署扩展
)

:skip_vercel
echo.
echo [3/5] 检查扩展目录...
if not exist "extensions\preorder-embed" (
    echo ❌ 找不到扩展目录
    pause
    goto menu
)
echo ✅ 扩展目录存在
echo.

echo [4/5] 部署 App Embed 扩展...
cd extensions\preorder-embed
echo 当前目录: %CD%
echo.
shopify app deploy

if %errorlevel% neq 0 (
    echo ❌ 扩展部署失败
    cd ..\..
    pause
    goto menu
)

cd ..\..
echo.
echo [5/5] 部署完成！
echo.
echo ========================================
echo ✅ 完整部署成功！
echo ========================================
echo.
goto next_steps

:embed
echo.
echo ========================================
echo 📦 部署 App Embed 扩展
echo ========================================
echo.

echo 检查登录状态...
shopify whoami
if %errorlevel% neq 0 (
    echo.
    echo 需要登录 Shopify CLI
    echo.
    shopify auth login
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 登录失败
        echo.
        pause
        goto menu
    )
)
echo.

echo 检查扩展目录...
if not exist "extensions\preorder-embed" (
    echo ❌ 找不到扩展目录: extensions\preorder-embed
    echo.
    echo 当前目录: %CD%
    echo.
    echo 请确认你在项目根目录运行此脚本
    echo.
    pause
    goto menu
)
echo ✅ 扩展目录存在
echo.

echo 进入扩展目录...
cd extensions\preorder-embed
echo ✅ 当前目录: %CD%
echo.

echo ========================================
echo 🚀 开始部署扩展...
echo ========================================
echo.
echo 请注意：
echo - 如果提示选择 App，请选择你的 PreOrder Pro
echo - 如果提示确认部署，请输入 yes
echo - 部署过程可能需要 1-2 分钟
echo.
pause

shopify app deploy

echo.
echo ========================================
if %errorlevel% equ 0 (
    echo ✅ 扩展部署成功！
) else (
    echo ❌ 部署失败（错误代码: %errorlevel%）
)
echo ========================================
echo.

cd ..\..
echo.
echo 按任意键继续...
pause >nul
goto next_steps

:vercel
echo.
echo ========================================
echo 🌐 部署到 Vercel
echo ========================================
echo.

where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装
    set /p install=是否安装？(yes/no): 
    if "%install%"=="yes" (
        npm install -g vercel
    ) else (
        pause
        goto menu
    )
)

vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 需要登录 Vercel
    vercel login
)

echo 开始部署...
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ✅ Vercel 部署成功！
) else (
    echo.
    echo ❌ 部署失败
)
pause
goto menu

:dev
echo.
echo ========================================
echo 🧪 启动开发模式
echo ========================================
echo.
echo 这将启动 Shopify App 开发服务器
echo 你可以在开发店铺中测试 App
echo.
echo 按 Ctrl+C 停止服务器
echo.
shopify app dev
pause
goto menu

:status
echo.
echo ========================================
echo 📊 部署状态
echo ========================================
echo.

echo [Shopify CLI 状态]
shopify whoami 2>nul
if %errorlevel% equ 0 (
    echo ✅ 已登录
) else (
    echo ❌ 未登录
)
echo.

echo [Vercel CLI 状态]
where vercel >nul 2>&1
if %errorlevel% equ 0 (
    vercel whoami 2>nul
    if %errorlevel% equ 0 (
        echo ✅ 已安装并登录
    ) else (
        echo ⚠️ 已安装但未登录
    )
) else (
    echo ❌ 未安装
)
echo.

echo [扩展目录]
if exist "extensions\preorder-embed" (
    echo ✅ 存在: extensions\preorder-embed
) else (
    echo ❌ 不存在
)
echo.

echo [配置文件]
if exist ".env" (
    echo ✅ .env 存在
) else (
    echo ❌ .env 不存在
)
if exist "shopify.app.toml" (
    echo ✅ shopify.app.toml 存在
) else (
    echo ❌ shopify.app.toml 不存在
)
echo.

pause
goto menu

:next_steps
echo 📝 下一步操作：
echo.
echo 1️⃣ 安装 App 到开发店铺
echo    运行: shopify app dev
echo    或在 Shopify Partners 后台手动安装
echo.
echo 2️⃣ 启用 App Embed
echo    Shopify Admin → Online Store → Themes
echo    → Customize → App embeds
echo    → 找到 "PreOrder Pro - 预购插件"
echo    → 打开开关 → Save
echo.
echo 3️⃣ 创建测试商品
echo    Products → Add product
echo    设置库存为 0
echo    Save
echo.
echo 4️⃣ 访问商品页面验证
echo    应该看到预购按钮和徽章
echo.
echo ========================================
echo.
pause
goto menu

:end
echo.
echo ========================================
echo 📋 快速参考
echo ========================================
echo.
echo 部署命令：
echo   完整部署: 运行此脚本选择选项 1
echo   仅扩展: 运行此脚本选择选项 2
echo   仅Vercel: 运行此脚本选择选项 3
echo.
echo 开发命令：
echo   shopify app dev - 启动开发服务器
echo   shopify app info - 查看 App 信息
echo.
echo 文档：
echo   无需CLI的部署方案.md
echo   最终方案_无需CLI.md
echo.
echo 👋 再见！
exit /b 0
