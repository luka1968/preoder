@echo off
echo 🚀 PreOrder Pro Extension 部署脚本
echo.

echo 📋 检查 Shopify CLI...
shopify version
if %errorlevel% neq 0 (
    echo ❌ Shopify CLI 未安装或未找到
    echo 请先安装 Shopify CLI: npm install -g @shopify/cli @shopify/theme
    pause
    exit /b 1
)

echo.
echo 🔐 检查登录状态...
shopify auth whoami
if %errorlevel% neq 0 (
    echo 🔑 需要登录 Shopify...
    shopify auth login
)

echo.
echo 📦 部署 App Extension...
shopify app deploy

echo.
echo ✅ 部署完成！
echo.
echo 📋 下一步操作：
echo 1. 进入 Shopify Admin
echo 2. Online Store → Themes → Customize
echo 3. 在左侧菜单找到 "App embeds"
echo 4. 启用 "PreOrder Pro Embed"
echo 5. 保存设置
echo.
pause
