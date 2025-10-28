@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 检查部署状态
echo ========================================
echo.

echo [1] 检查 Shopify CLI 状态
echo ----------------------------------------
shopify whoami
if %errorlevel% equ 0 (
    echo ✅ Shopify CLI 已登录
) else (
    echo ❌ Shopify CLI 未登录
)
echo.

echo [2] 检查 Shopify App 信息
echo ----------------------------------------
shopify app info
echo.

echo [3] 检查扩展列表
echo ----------------------------------------
shopify app extension list
echo.

echo [4] 检查 Vercel 部署
echo ----------------------------------------
where vercel >nul 2>&1
if %errorlevel% equ 0 (
    echo Vercel CLI 已安装
    vercel ls --scope=your-team 2>nul
    if %errorlevel% neq 0 (
        vercel ls 2>nul
    )
) else (
    echo Vercel CLI 未安装
)
echo.

echo ========================================
echo 📝 手动验证方法
echo ========================================
echo.
echo 1. 访问 Shopify Partners:
echo    https://partners.shopify.com/
echo    → 进入你的 App
echo    → 点击 Extensions
echo    → 应该能看到 "PreOrder Pro" 扩展
echo.
echo 2. 访问 Vercel Dashboard:
echo    https://vercel.com/dashboard
echo    → 查看最新部署
echo    → 应该显示 "Ready"
echo.
echo 3. 测试 Vercel 部署:
echo    访问: https://shopmall.dpdns.org/shopify-integration.js
echo    应该能看到 JavaScript 代码
echo.
echo ========================================
echo.
pause
