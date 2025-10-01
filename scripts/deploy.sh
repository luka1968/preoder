#!/bin/bash

# PreOrder Pro 快速部署脚本
echo "🚀 开始部署 PreOrder Pro 到 Shopify..."

# 检查必要的工具
command -v git >/dev/null 2>&1 || { echo "❌ Git 未安装. 请先安装 Git." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Node.js/npm 未安装. 请先安装 Node.js." >&2; exit 1; }

echo "✅ 环境检查通过"

# 1. 安装依赖
echo "📦 安装项目依赖..."
npm install

# 2. 构建项目
echo "🔨 构建项目..."
npm run build

# 3. 检查环境变量
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local 文件不存在，从模板创建..."
    cp .env.example .env.local
    echo "📝 请编辑 .env.local 文件，填入正确的环境变量"
    echo "   - SHOPIFY_API_KEY"
    echo "   - SHOPIFY_API_SECRET" 
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    read -p "按 Enter 继续..."
fi

# 4. 提交代码到 Git
echo "📤 提交代码到 Git..."
git add .
git commit -m "Ready for deployment - $(date)"

# 5. 推送到远程仓库
echo "🔄 推送到远程仓库..."
git push origin main

echo "✅ 代码已推送到 GitHub"
echo ""
echo "🎯 下一步操作："
echo "1. 访问 https://vercel.com"
echo "2. 导入你的 GitHub 仓库"
echo "3. 配置环境变量"
echo "4. 部署完成后，访问 https://partners.shopify.com"
echo "5. 创建新的 Shopify App"
echo "6. 配置 App URL 为你的 Vercel 域名"
echo ""
echo "📚 详细部署指南请查看: docs/deployment-guide.md"
