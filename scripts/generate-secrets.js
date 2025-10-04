#!/usr/bin/env node

/**
 * 生成安全的环境变量密钥
 * 使用方法: node scripts/generate-secrets.js
 */

const crypto = require('crypto')

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex')
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64url')
}

function generateUUID() {
  return crypto.randomUUID()
}

console.log('🔐 生成安全的环境变量密钥\n')

console.log('# 复制以下内容到你的 Vercel 环境变量中:')
console.log('# ⚠️  这些是随机生成的密钥，请妥善保管\n')

console.log('# JWT 密钥 (用于身份验证)')
console.log(`JWT_SECRET=${generateJWTSecret()}`)
console.log()

console.log('# NextAuth 密钥 (如果使用 NextAuth)')
console.log(`NEXTAUTH_SECRET=${generateSecureSecret(32)}`)
console.log()

console.log('# Cron 任务密钥 (用于定时任务验证)')
console.log(`CRON_SECRET=${generateSecureSecret(32)}`)
console.log()

console.log('# Webhook 密钥 (用于 Shopify Webhook 验证)')
console.log(`SHOPIFY_WEBHOOK_SECRET=${generateSecureSecret(32)}`)
console.log()

console.log('# 加密密钥 (用于敏感数据加密)')
console.log(`ENCRYPTION_KEY=${generateSecureSecret(16)}`)
console.log()

console.log('# 会话 ID (可选)')
console.log(`SESSION_ID=${generateUUID()}`)
console.log()

console.log('📋 其他需要手动配置的环境变量:')
console.log('# 从 Shopify Partner Dashboard 获取:')
console.log('SHOPIFY_API_KEY=your_api_key_from_partner_dashboard')
console.log('SHOPIFY_API_SECRET=your_api_secret_from_partner_dashboard')
console.log()

console.log('# 从 Supabase Dashboard 获取:')
console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
console.log()

console.log('# 应用配置:')
console.log('SHOPIFY_APP_URL=https://your-app.vercel.app')
console.log('NEXT_PUBLIC_APP_URL=https://your-app.vercel.app')
console.log('NODE_ENV=production')
console.log()

console.log('✅ 密钥生成完成!')
console.log('🔒 请将这些密钥安全地存储在 Vercel 环境变量中')
console.log('⚠️  永远不要将这些密钥提交到代码仓库中')
