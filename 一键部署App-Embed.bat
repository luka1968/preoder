@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 一键部署 App Embed 扩展
echo ========================================
echo.

echo 📍 当前目录: %CD%
echo.

echo [步骤 1/4] 检查 Shopify CLI 登录状态...
shopify whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未登录 Shopify CLI
    echo.
    echo 请先运行: shopify auth login
    pause
    exit /b 1
)
echo ✅ 已登录 Shopify CLI
echo.

echo [步骤 2/4] 进入扩展目录...
if not exist "extensions\preorder-embed" (
    echo ❌ 找不到扩展目录: extensions\preorder-embed
    echo.
    echo 请确认你在项目根目录运行此脚本
    pause
    exit /b 1
)

cd extensions\preorder-embed
echo ✅ 已进入扩展目录: %CD%
echo.

echo [步骤 3/4] 部署 App Embed 扩展...
echo.
echo 正在部署，请稍候...
echo.
shopify app deploy

if %errorlevel% neq 0 (
    echo.
    echo ❌ 部署失败
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 配置文件错误
    echo 3. 权限不足
    echo.
    cd ..\..
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 部署成功！
echo ========================================
echo.

cd ..\..

echo [步骤 4/4] 下一步操作...
echo.
echo 📝 现在你需要：
echo.
echo 1. 安装 App 到开发店铺
echo    方法A: 运行 shopify app dev
echo    方法B: 在 Shopify Partners 后台手动安装
echo.
echo 2. 在 Shopify Admin 中启用 App Embed
echo    路径: Online Store → Themes → Customize
echo         → Theme settings → App embeds
echo         → 找到 "PreOrder Pro - 预购插件"
echo         → 打开开关 → Save
echo.
echo 3. 创建测试商品（库存设为 0）
echo.
echo 4. 访问商品页面验证预购按钮
echo.
echo ========================================
echo.
pause
