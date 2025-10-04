#!/bin/bash

# Vercel 环境变量快速配置脚本
# 使用方法: bash scripts/setup-vercel-env.sh

echo "🚀 Vercel 环境变量配置向导"
echo "================================"
echo ""

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "请先安装: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 已安装"
echo ""

# 登录检查
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel:"
    vercel login
fi

echo "✅ 已登录 Vercel"
echo ""

# 链接项目
echo "🔗 链接到 Vercel 项目..."
vercel link

echo ""
echo "📝 现在开始配置环境变量..."
echo "💡 提示: 按 Ctrl+C 可随时退出"
echo ""

# 配置环境变量
echo "1️⃣ 配置 Shopify API Key"
echo "请从 Shopify Partner Dashboard 获取 API Key:"
read -p "SHOPIFY_API_KEY: " shopify_api_key
if [ ! -z "$shopify_api_key" ]; then
    vercel env add SHOPIFY_API_KEY production <<< "$shopify_api_key"
    vercel env add SHOPIFY_API_KEY preview <<< "$shopify_api_key"
    vercel env add SHOPIFY_API_KEY development <<< "$shopify_api_key"
    echo "✅ SHOPIFY_API_KEY 已设置"
fi

echo ""
echo "2️⃣ 配置 Shopify API Secret"
echo "请从 Shopify Partner Dashboard 获取 API Secret:"
read -s -p "SHOPIFY_API_SECRET: " shopify_api_secret
echo ""
if [ ! -z "$shopify_api_secret" ]; then
    vercel env add SHOPIFY_API_SECRET production <<< "$shopify_api_secret"
    vercel env add SHOPIFY_API_SECRET preview <<< "$shopify_api_secret"
    vercel env add SHOPIFY_API_SECRET development <<< "$shopify_api_secret"
    echo "✅ SHOPIFY_API_SECRET 已设置"
fi

echo ""
echo "3️⃣ 配置 Supabase URL"
echo "请从 Supabase Dashboard 获取项目 URL:"
read -p "NEXT_PUBLIC_SUPABASE_URL: " supabase_url
if [ ! -z "$supabase_url" ]; then
    vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$supabase_url"
    vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "$supabase_url"
    vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "$supabase_url"
    echo "✅ NEXT_PUBLIC_SUPABASE_URL 已设置"
fi

echo ""
echo "4️⃣ 配置 Supabase Anon Key"
echo "请从 Supabase Dashboard 获取 Anon Key:"
read -p "NEXT_PUBLIC_SUPABASE_ANON_KEY: " supabase_anon_key
if [ ! -z "$supabase_anon_key" ]; then
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$supabase_anon_key"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "$supabase_anon_key"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "$supabase_anon_key"
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置"
fi

echo ""
echo "5️⃣ 配置 Supabase Service Role Key"
echo "请从 Supabase Dashboard 获取 Service Role Key:"
read -s -p "SUPABASE_SERVICE_ROLE_KEY: " supabase_service_key
echo ""
if [ ! -z "$supabase_service_key" ]; then
    vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$supabase_service_key"
    vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "$supabase_service_key"
    vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "$supabase_service_key"
    echo "✅ SUPABASE_SERVICE_ROLE_KEY 已设置"
fi

echo ""
echo "6️⃣ 生成并配置 JWT Secret"
echo "正在生成安全的 JWT Secret..."
jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
vercel env add JWT_SECRET production <<< "$jwt_secret"
vercel env add JWT_SECRET preview <<< "$jwt_secret"
vercel env add JWT_SECRET development <<< "$jwt_secret"
echo "✅ JWT_SECRET 已生成并设置"

echo ""
echo "7️⃣ 配置其他必需变量"

# Shopify Scopes
shopify_scopes="read_products,write_products,read_orders,write_orders,read_inventory,write_inventory"
vercel env add SHOPIFY_SCOPES production <<< "$shopify_scopes"
vercel env add SHOPIFY_SCOPES preview <<< "$shopify_scopes"
vercel env add SHOPIFY_SCOPES development <<< "$shopify_scopes"
echo "✅ SHOPIFY_SCOPES 已设置"

# App URL (需要用户输入)
echo "请输入你的 Vercel 应用域名:"
read -p "SHOPIFY_APP_URL (例: https://your-app.vercel.app): " app_url
if [ ! -z "$app_url" ]; then
    vercel env add SHOPIFY_APP_URL production <<< "$app_url"
    vercel env add SHOPIFY_APP_URL preview <<< "$app_url"
    vercel env add SHOPIFY_APP_URL development <<< "$app_url"
    vercel env add NEXT_PUBLIC_APP_URL production <<< "$app_url"
    vercel env add NEXT_PUBLIC_APP_URL preview <<< "$app_url"
    vercel env add NEXT_PUBLIC_APP_URL development <<< "$app_url"
    echo "✅ App URLs 已设置"
fi

# 生成其他密钥
cron_secret=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
vercel env add CRON_SECRET production <<< "$cron_secret"
vercel env add CRON_SECRET preview <<< "$cron_secret"
vercel env add CRON_SECRET development <<< "$cron_secret"
echo "✅ CRON_SECRET 已生成并设置"

webhook_secret=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
vercel env add SHOPIFY_WEBHOOK_SECRET production <<< "$webhook_secret"
vercel env add SHOPIFY_WEBHOOK_SECRET preview <<< "$webhook_secret"
vercel env add SHOPIFY_WEBHOOK_SECRET development <<< "$webhook_secret"
echo "✅ SHOPIFY_WEBHOOK_SECRET 已生成并设置"

echo ""
echo "🎉 环境变量配置完成!"
echo ""
echo "📋 已配置的环境变量:"
vercel env ls

echo ""
echo "🚀 下一步操作:"
echo "1. 重新部署应用: vercel --prod"
echo "2. 测试健康检查: curl https://your-app.vercel.app/api/health"
echo "3. 在 Shopify Partner Dashboard 中创建应用"
echo ""
echo "📚 详细文档: docs/deployment-guide.md"
