@echo off
chcp 65001 >nul

echo.
echo ========================================
echo 🚀 PreOrder Pro - 部署 App Embed 扩展
echo ========================================
echo.

REM 获取脚本所在目录
set SCRIPT_DIR=%~dp0
echo 脚本位置: %SCRIPT_DIR%
echo.

REM 切换到脚本所在目录（项目根目录）
cd /d "%SCRIPT_DIR%"
echo 切换到项目目录: %CD%
echo.

REM 检查是否在项目根目录
if not exist "extensions\preorder-embed" (
    echo ❌ 错误：找不到扩展目录
    echo.
    echo 当前目录: %CD%
    echo 需要的目录: extensions\preorder-embed
    echo.
    pause
    exit /b 1
)

echo ✅ 找到扩展目录
echo.

REM 检查 Shopify CLI 登录状态
echo 检查 Shopify CLI 登录状态...
shopify whoami
if %errorlevel% neq 0 (
    echo.
    echo ❌ 未登录 Shopify CLI
    echo.
    echo 请先运行: shopify auth login
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 已登录 Shopify CLI
echo.

REM 进入扩展目录
echo 进入扩展目录...
cd extensions\preorder-embed
echo ✅ 当前目录: %CD%
echo.

REM 显示扩展配置
echo 扩展配置信息:
echo ----------------------------------------
type shopify.extension.toml
echo ----------------------------------------
echo.

REM 开始部署
echo.
echo ========================================
echo 🚀 开始部署扩展
echo ========================================
echo.
echo 注意事项：
echo 1. 如果提示选择 App，请选择 "PreOrder Pro"
echo 2. 如果提示确认部署，请输入 "yes" 或 "y"
echo 3. 部署过程可能需要 1-2 分钟，请耐心等待
echo 4. 不要关闭此窗口
echo.
echo 按任意键开始部署...
pause >nul

echo.
echo 正在部署...
echo.

REM 执行部署命令
shopify app deploy

REM 保存错误代码
set DEPLOY_ERROR=%errorlevel%

echo.
echo ========================================
if %DEPLOY_ERROR% equ 0 (
    echo ✅ 部署成功！
    echo ========================================
    echo.
    echo 📝 下一步操作：
    echo.
    echo 1. 在 Shopify Partners 后台验证
    echo    https://partners.shopify.com/
    echo    → 进入你的 App
    echo    → 点击 Extensions
    echo    → 应该能看到 "PreOrder Pro" 扩展
    echo.
    echo 2. 安装 App 到开发店铺
    echo    运行: shopify app dev
    echo    或在 Partners 后台手动安装
    echo.
    echo 3. 在 Shopify Admin 中启用 App Embed
    echo    Online Store → Themes → Customize
    echo    → Theme settings → App embeds
    echo    → 找到 "PreOrder Pro - 预购插件"
    echo    → 打开开关 → Save
    echo.
    echo 4. 创建测试商品（库存设为 0）
    echo.
    echo 5. 访问商品页面验证预购按钮
    echo.
) else (
    echo ❌ 部署失败（错误代码: %DEPLOY_ERROR%）
    echo ========================================
    echo.
    echo 可能的原因：
    echo 1. 网络连接问题
    echo 2. 配置文件错误
    echo 3. 权限不足
    echo 4. Shopify API 问题
    echo.
    echo 解决方法：
    echo 1. 检查网络连接
    echo 2. 重新登录: shopify auth logout 然后 shopify auth login
    echo 3. 检查 shopify.extension.toml 配置
    echo 4. 稍后重试
    echo.
)

REM 返回项目根目录
cd ..\..
echo.
echo 已返回项目根目录: %CD%
echo.

echo ========================================
echo.
echo 按任意键退出...
pause >nul
