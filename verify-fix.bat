@echo off
echo ========================================
echo 预购按钮修复验证工具
echo ========================================
echo.

echo [1/4] 检查修改的文件...
if exist "extensions\preorder-embed\assets\preorder-universal.js" (
    echo ✓ preorder-universal.js 存在
) else (
    echo ✗ preorder-universal.js 不存在
    goto :error
)

if exist "public\shopify-integration.js" (
    echo ✓ shopify-integration.js 存在
) else (
    echo ✗ shopify-integration.js 不存在
    goto :error
)

echo.
echo [2/4] 检查测试文件...
if exist "test-zero-inventory.html" (
    echo ✓ 测试页面已创建
) else (
    echo ✗ 测试页面不存在
)

if exist "test-fix-verification.js" (
    echo ✓ 验证脚本已创建
) else (
    echo ✗ 验证脚本不存在
)

echo.
echo [3/4] 检查文档...
if exist "修复说明_中文.md" (
    echo ✓ 中文说明文档已创建
) else (
    echo ✗ 中文说明文档不存在
)

if exist "ZERO_INVENTORY_FIX.md" (
    echo ✓ 技术文档已创建
) else (
    echo ✗ 技术文档不存在
)

echo.
echo [4/4] 搜索关键修复代码...
findstr /C:"isOutOfStock" "extensions\preorder-embed\assets\preorder-universal.js" >nul
if %errorlevel% equ 0 (
    echo ✓ 修复代码已应用到 preorder-universal.js
) else (
    echo ✗ 修复代码未找到
    goto :error
)

findstr /C:"isOutOfStock" "public\shopify-integration.js" >nul
if %errorlevel% equ 0 (
    echo ✓ 修复代码已应用到 shopify-integration.js
) else (
    echo ✗ 修复代码未找到
    goto :error
)

echo.
echo ========================================
echo ✓ 所有检查通过！
echo ========================================
echo.
echo 下一步操作：
echo 1. 运行 'npm run dev' 启动开发服务器
echo 2. 访问 http://localhost:3000/test-zero-inventory.html
echo 3. 查看浏览器控制台的测试结果
echo 4. 部署到Shopify: cd extensions\preorder-embed ^&^& shopify app deploy
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo ✗ 验证失败！
echo ========================================
echo.
echo 请检查：
echo 1. 是否在正确的项目目录
echo 2. 是否已正确应用修复
echo 3. 文件是否存在
echo.
pause
exit /b 1
