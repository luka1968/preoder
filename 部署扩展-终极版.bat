@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo 🚀 PreOrder Pro - App Embed 扩展部署
echo ========================================
echo.

REM 自动切换到脚本所在目录
cd /d "%~dp0"

echo [1/6] 检查项目目录
echo ----------------------------------------
echo 当前目录: %CD%
echo.

if not exist "extensions\preorder-embed" (
    echo ❌ 找不到扩展目录
    echo.
    echo 请确保此脚本在项目根目录
    echo 项目根目录应该是: D:\360\git2\preoder
    echo.
    pause
    exit /b 1
)

echo ✅ 项目目录正确
echo.

echo [2/6] 检查 Shopify CLI
echo ----------------------------------------
shopify version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Shopify CLI 未安装
    echo.
    pause
    exit /b 1
)

shopify whoami
if %errorlevel% neq 0 (
    echo.
    echo ❌ 未登录 Shopify CLI
    echo 请先运行: shopify auth login
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Shopify CLI 已登录
echo.

echo [3/6] 显示扩展信息
echo ----------------------------------------
cd extensions\preorder-embed
echo 扩展目录: %CD%
echo.
echo 配置文件内容:
type shopify.extension.toml
echo.

echo [4/6] 准备部署
echo ----------------------------------------
echo 即将部署 App Embed 扩展
echo.
echo 提示：
echo - 如果询问选择 App，选择 PreOrder Pro
echo - 如果询问确认，输入 yes
echo - 部署需要 1-2 分钟
echo.
pause

echo.
echo [5/6] 执行部署
echo ----------------------------------------
echo 正在部署，请稍候...
echo.

shopify app deploy

set ERROR_CODE=%errorlevel%

echo.
echo [6/6] 部署结果
echo ========================================

if %ERROR_CODE% equ 0 (
    echo.
    echo ✅✅✅ 部署成功！✅✅✅
    echo.
    echo ========================================
    echo 📝 下一步操作
    echo ========================================
    echo.
    echo 1. 验证部署
    echo    访问: https://partners.shopify.com/
    echo    进入你的 App - Extensions
    echo    应该能看到 PreOrder Pro 扩展
    echo.
    echo 2. 安装到开发店铺
    echo    在命令行运行: shopify app dev
    echo.
    echo 3. 启用 App Embed
    echo    Shopify Admin - Online Store - Themes
    echo    - Customize - App embeds
    echo    - 打开 PreOrder Pro 开关
    echo    - Save
    echo.
    echo 4. 测试
    echo    创建库存为0的商品
    echo    访问商品页面
    echo    应该看到预购按钮
    echo.
) else (
    echo.
    echo ❌❌❌ 部署失败 ❌❌❌
    echo.
    echo 错误代码: %ERROR_CODE%
    echo.
    echo 可能原因:
    echo 1. 网络问题
    echo 2. 配置错误
    echo 3. 权限不足
    echo.
    echo 解决方法:
    echo 1. 检查网络连接
    echo 2. 重新登录: shopify auth logout
    echo    然后: shopify auth login
    echo 3. 重新运行此脚本
    echo.
)

cd ..\..
echo.
echo 已返回项目根目录: %CD%
echo.
echo ========================================
echo.
pause
