@echo off
echo ========================================
echo 更新 Shopify 应用 Redirect URL
echo ========================================
echo.

echo 当前配置:
echo App URL: https://shopmall.dpdns.org
echo Redirect URL: https://shopmall.dpdns.org/api/auth/shopify
echo.

echo 正在推送配置到 Shopify...
shopify app config push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 配置更新成功！
    echo.
    echo 现在可以重新安装应用:
    echo https://shopmall.dpdns.org/api/auth/shopify?shop=arivi-shop.myshopify.com
) else (
    echo.
    echo ❌ 配置更新失败
    echo.
    echo 可能的原因:
    echo 1. 未安装 Shopify CLI
    echo 2. 未登录 Shopify Partner 账号
    echo 3. 应用配置被锁定
    echo.
    echo 解决方法:
    echo 1. 安装 Shopify CLI: npm install -g @shopify/cli
    echo 2. 登录: shopify auth login
    echo 3. 或者在 Partner Dashboard 中手动创建新版本
)

echo.
pause
