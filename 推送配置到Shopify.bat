@echo off
chcp 65001 >nul
cls

echo ========================================
echo 🚀 推送配置到 Shopify
echo ========================================
echo.

REM 切换到项目目录
cd /d "%~dp0"

echo [1/3] 检查登录状态
echo ----------------------------------------
shopify whoami
if %errorlevel% neq 0 (
    echo ❌ 未登录
    echo 请先运行: shopify auth login
    pause
    exit /b 1
)
echo ✅ 已登录
echo.

echo [2/3] 推送配置到 Shopify
echo ----------------------------------------
echo.
echo 这将更新你的 App 配置，包括：
echo - App URL: https://shopmall.dpdns.org
echo - 回调 URLs
echo.
pause

shopify app config push

if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 可能原因：
    echo 1. shopify.app.toml 配置错误
    echo 2. 网络问题
    echo 3. 权限不足
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 配置推送成功！
echo.

echo [3/3] 下一步
echo ========================================
echo.
echo 配置已更新，现在可以：
echo.
echo 1. 重新安装 App 到开发店铺
echo    访问: https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
echo.
echo 2. 或使用开发模式
echo    运行: shopify app dev
echo.
echo ========================================
echo.
pause
