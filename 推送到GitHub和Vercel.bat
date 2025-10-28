@echo off
chcp 65001 >nul
cls

echo ========================================
echo 🚀 推送到 GitHub 并部署到 Vercel
echo ========================================
echo.

REM 切换到项目目录
cd /d "%~dp0"

echo [1/5] 检查 Git 状态
echo ----------------------------------------
git status
echo.

echo [2/5] 添加所有文件
echo ----------------------------------------
git add .
echo ✅ 文件已添加
echo.

echo [3/5] 提交更改
echo ----------------------------------------
set /p commit_msg=请输入提交信息（直接回车使用默认）: 
if "%commit_msg%"=="" (
    set commit_msg=修复：库存为0时预购按钮不显示 + 自动脚本注入
)
git commit -m "%commit_msg%"
echo ✅ 更改已提交
echo.

echo [4/5] 推送到 GitHub
echo ----------------------------------------
echo 正在推送...
git push origin main

if %errorlevel% equ 0 (
    echo ✅ 推送成功！
) else (
    echo ❌ 推送失败
    echo.
    echo 可能原因：
    echo 1. 没有配置 Git 远程仓库
    echo 2. 没有权限
    echo 3. 网络问题
    echo.
    pause
    exit /b 1
)
echo.

echo [5/5] Vercel 部署状态
echo ----------------------------------------
echo.
echo ✅ GitHub 推送成功！
echo.
echo 📝 下一步：
echo.
echo 1. Vercel 会自动检测并部署（需要 1-3 分钟）
echo.
echo 2. 访问 Vercel Dashboard 查看部署状态：
echo    https://vercel.com/dashboard
echo.
echo 3. 部署完成后，需要在 Vercel 设置环境变量：
echo    - 进入项目 Settings → Environment Variables
echo    - 从 .env.production.local 复制所有变量
echo    - 添加到 Vercel（选择 Production 环境）
echo.
echo 4. 重新部署以应用环境变量：
echo    - 在 Vercel Dashboard 点击 Redeploy
echo.
echo 5. 测试预购功能：
echo    - 访问: https://shopmall.dpdns.org/manual-install
echo    - 或重新安装 App 到开发店铺
echo    - 创建库存为0的商品测试
echo.
echo ========================================
echo.
pause
