@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 PreOrder Pro 部署脚本
echo ========================================
echo.

:menu
echo 请选择部署选项：
echo.
echo [1] 验证修复（本地检查）
echo [2] 部署到 Vercel
echo [3] 部署 App Embed 扩展
echo [4] 完整部署（Vercel + 扩展）
echo [5] 启动本地测试
echo [6] 退出
echo.
set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto verify
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto extension
if "%choice%"=="4" goto full
if "%choice%"=="5" goto test
if "%choice%"=="6" goto end
echo 无效选项，请重新选择
goto menu

:verify
echo.
echo ========================================
echo 📋 验证修复...
echo ========================================
call verify-fix.bat
goto menu

:vercel
echo.
echo ========================================
echo 🌐 部署到 Vercel...
echo ========================================
echo.
echo 检查 Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装
    echo.
    echo 请运行: npm install -g vercel
    pause
    goto menu
)

echo ✓ Vercel CLI 已安装
echo.
echo 开始部署...
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ✅ Vercel 部署成功！
    echo.
    echo 📝 请记录部署的 URL
    echo 📝 然后在 Shopify Partners 中更新 App URL
) else (
    echo.
    echo ❌ Vercel 部署失败
    echo 请检查错误信息
)
pause
goto menu

:extension
echo.
echo ========================================
echo 📦 部署 App Embed 扩展...
echo ========================================
echo.
echo 检查 Shopify CLI...
where shopify >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Shopify CLI 未安装
    echo.
    echo 请访问: https://shopify.dev/docs/api/shopify-cli
    pause
    goto menu
)

echo ✓ Shopify CLI 已安装
echo.
echo 进入扩展目录...
cd extensions\preorder-embed

echo.
echo 开始部署扩展...
shopify app deploy

if %errorlevel% equ 0 (
    echo.
    echo ✅ 扩展部署成功！
    echo.
    echo 📝 下一步：
    echo 1. 在 Shopify Admin 中启用 App Embed
    echo 2. 访问商品页面测试
) else (
    echo.
    echo ❌ 扩展部署失败
    echo 请检查错误信息
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
echo 步骤 1/3: 验证修复...
call verify-fix.bat
if %errorlevel% neq 0 (
    echo ❌ 验证失败，终止部署
    pause
    goto menu
)

echo.
echo 步骤 2/3: 部署到 Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Vercel 部署失败，终止流程
    pause
    goto menu
)

echo.
echo 步骤 3/3: 部署扩展...
cd extensions\preorder-embed
shopify app deploy
cd ..\..

echo.
echo ========================================
echo ✅ 完整部署完成！
echo ========================================
echo.
echo 📝 下一步操作：
echo 1. 在 Shopify Partners 更新 App URL
echo 2. 在开发店铺安装/更新 App
echo 3. 启用 App Embed
echo 4. 创建测试商品（库存=0）
echo 5. 访问商品页面验证
echo.
pause
goto menu

:test
echo.
echo ========================================
echo 🧪 启动本地测试服务器
echo ========================================
echo.
echo 启动开发服务器...
echo 访问: http://localhost:3000/test-zero-inventory.html
echo.
echo 按 Ctrl+C 停止服务器
echo.
npm run dev
goto menu

:end
echo.
echo 👋 再见！
exit /b 0
