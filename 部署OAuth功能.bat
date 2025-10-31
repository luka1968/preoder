@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   部署 OAuth 安装功能
echo ========================================
echo.

echo [1/3] 添加文件到 Git...
git add pages/api/auth/callback.ts
git add pages/api/auth/install.ts
git add pages/install.tsx
git add pages/install-success.tsx
git add supabase-shops-table.sql
git add 完整安装指南_Shopify订单.md

echo.
echo [2/3] 提交更改...
git commit -m "添加OAuth安装功能 - 支持Shopify订单创建"

echo.
echo [3/3] 推送到远程仓库...
git push

echo.
echo ========================================
echo   ✅ 部署完成！
echo ========================================
echo.
echo 📋 接下来的步骤：
echo.
echo 1. 等待 Vercel 自动部署完成（约1-2分钟）
echo.
echo 2. 在 Supabase 运行 SQL：
echo    打开 supabase-shops-table.sql 文件
echo    复制内容到 Supabase SQL Editor 运行
echo.
echo 3. 访问安装页面：
echo    https://你的域名.vercel.app/install
echo.
echo 4. 输入店铺域名并安装
echo.
echo 5. 测试预购功能，检查 Shopify 后台订单
echo.
echo ========================================
echo.
pause
