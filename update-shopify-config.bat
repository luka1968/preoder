@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 更新 Shopify 应用配置
echo ========================================
echo.

echo 📋 当前配置:
echo App URL: https://shopmall.dpdns.org
echo Redirect URL: https://shopmall.dpdns.org/api/auth/shopify
echo.

echo 🔄 推送配置到 Shopify...
echo.

REM 检查是否安装了 Shopify CLI
where shopify >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 Shopify CLI
    echo.
    echo 请先安装 Shopify CLI:
    echo npm install -g @shopify/cli @shopify/app
    echo.
    echo 或者使用 Partner Dashboard 手动创建新版本
    pause
    exit /b 1
)

echo ✅ 找到 Shopify CLI
echo.

REM 推送配置
echo 正在推送配置...
shopify app config push

if %errorlevel% equ 0 (
    echo.
    echo ✅ 配置推送成功！
    echo.
    echo 📝 下一步:
    echo 1. 访问 Partner Dashboard 查看新版本
    echo 2. 发布新版本
    echo 3. 重新安装应用到测试店铺
    echo.
) else (
    echo.
    echo ❌ 配置推送失败
    echo.
    echo 💡 解决方案:
    echo 1. 确保已登录: shopify auth login
    echo 2. 或者在 Partner Dashboard 手动创建新版本
    echo.
)

pause
