@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 Vercel CLI 部署脚本
echo ========================================
echo.

echo 检查 Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装
    echo.
    echo 正在安装 Vercel CLI...
    npm install -g vercel
    
    if %errorlevel% neq 0 (
        echo ❌ 安装失败
        pause
        exit /b 1
    )
)

echo ✓ Vercel CLI 已安装
echo.

:menu
echo 请选择部署选项：
echo.
echo [1] 登录 Vercel
echo [2] 部署到预览环境
echo [3] 部署到生产环境
echo [4] 查看部署状态
echo [5] 设置环境变量
echo [6] 退出
echo.
set /p choice=请输入选项 (1-6): 

if "%choice%"=="1" goto login
if "%choice%"=="2" goto preview
if "%choice%"=="3" goto production
if "%choice%"=="4" goto status
if "%choice%"=="5" goto env
if "%choice%"=="6" goto end
echo 无效选项，请重新选择
goto menu

:login
echo.
echo ========================================
echo 🔐 登录 Vercel
echo ========================================
vercel login
pause
goto menu

:preview
echo.
echo ========================================
echo 📦 部署到预览环境
echo ========================================
vercel
pause
goto menu

:production
echo.
echo ========================================
echo 🚀 部署到生产环境
echo ========================================
echo.
echo ⚠️ 确认要部署到生产环境吗？
set /p confirm=输入 yes 确认: 

if not "%confirm%"=="yes" (
    echo 取消部署
    pause
    goto menu
)

echo.
echo 开始部署...
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 部署成功！
    echo ========================================
    echo.
    echo 📝 下一步：
    echo 1. 记录部署的 URL
    echo 2. 部署 Shopify 扩展: shopify app deploy
    echo 3. 在开发店铺测试
) else (
    echo.
    echo ❌ 部署失败
)
pause
goto menu

:status
echo.
echo ========================================
echo 📊 查看部署状态
echo ========================================
vercel ls
pause
goto menu

:env
echo.
echo ========================================
echo ⚙️ 设置环境变量
echo ========================================
echo.
echo 环境变量管理：
echo 1. 访问 Vercel Dashboard
echo 2. 进入项目设置
echo 3. Environment Variables
echo.
echo 或使用命令：
echo vercel env add VARIABLE_NAME
echo.
pause
goto menu

:end
echo.
echo 👋 再见！
exit /b 0
