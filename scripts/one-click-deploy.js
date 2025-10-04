#!/usr/bin/env node

/**
 * 一键部署脚本 - 最简单的自动化方案
 * 
 * 使用方法:
 * 1. npm run deploy:auto
 * 2. 按提示输入必要的密钥
 * 3. 自动完成所有配置
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const crypto = require('crypto')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve)
  })
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(`${colors.cyan}${prompt}${colors.reset}`)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    
    let input = ''
    process.stdin.on('data', (char) => {
      char = char.toString()
      
      if (char === '\n' || char === '\r' || char === '\u0004') {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        process.stdout.write('\n')
        resolve(input)
      } else if (char === '\u0003') {
        process.exit()
      } else if (char === '\u007f') {
        if (input.length > 0) {
          input = input.slice(0, -1)
          process.stdout.write('\b \b')
        }
      } else {
        input += char
        process.stdout.write('*')
      }
    })
  })
}

async function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function installVercelCLI() {
  log('📦 安装 Vercel CLI...', 'blue')
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' })
    log('✅ Vercel CLI 安装成功', 'green')
  } catch (error) {
    log('❌ Vercel CLI 安装失败', 'red')
    throw error
  }
}

async function loginVercel() {
  log('🔐 登录 Vercel...', 'blue')
  try {
    execSync('vercel login', { stdio: 'inherit' })
    log('✅ Vercel 登录成功', 'green')
  } catch (error) {
    log('❌ Vercel 登录失败', 'red')
    throw error
  }
}

async function linkProject() {
  log('🔗 链接项目到 Vercel...', 'blue')
  try {
    execSync('vercel link', { stdio: 'inherit' })
    log('✅ 项目链接成功', 'green')
  } catch (error) {
    log('❌ 项目链接失败', 'red')
    throw error
  }
}

function generateSecrets() {
  return {
    JWT_SECRET: crypto.randomBytes(32).toString('base64url'),
    CRON_SECRET: crypto.randomBytes(16).toString('hex'),
    SHOPIFY_WEBHOOK_SECRET: crypto.randomBytes(16).toString('hex'),
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex')
  }
}

async function addEnvVar(key, value, environments = ['production', 'preview', 'development']) {
  for (const env of environments) {
    try {
      const command = `echo "${value}" | vercel env add ${key} ${env}`
      execSync(command, { stdio: 'ignore' })
      log(`  ✅ ${key} (${env})`, 'green')
    } catch (error) {
      log(`  ⚠️  ${key} (${env}) - 可能已存在`, 'yellow')
    }
  }
}

async function main() {
  log('🚀 PreOrder Pro 一键部署工具', 'blue')
  log('===============================\n', 'blue')

  try {
    // 检查 Vercel CLI
    if (!(await checkVercelCLI())) {
      const install = await question('Vercel CLI 未安装，是否自动安装? (y/n): ')
      if (install.toLowerCase() === 'y') {
        await installVercelCLI()
      } else {
        log('请手动安装: npm install -g vercel', 'yellow')
        process.exit(1)
      }
    } else {
      log('✅ Vercel CLI 已安装', 'green')
    }

    // 登录 Vercel
    try {
      execSync('vercel whoami', { stdio: 'ignore' })
      log('✅ 已登录 Vercel', 'green')
    } catch {
      await loginVercel()
    }

    // 链接项目
    await linkProject()

    log('\n📝 收集必要的配置信息...', 'blue')
    log('💡 提示: 按 Ctrl+C 可随时退出\n', 'yellow')

    // 收集 Shopify 信息
    log('🏪 Shopify 配置 (从 Partner Dashboard 获取):', 'cyan')
    const shopifyApiKey = await question('SHOPIFY_API_KEY: ')
    const shopifyApiSecret = await questionHidden('SHOPIFY_API_SECRET (隐藏输入): ')

    // 收集 Supabase 信息
    log('\n🗄️  Supabase 配置 (从 Supabase Dashboard 获取):', 'cyan')
    const supabaseUrl = await question('NEXT_PUBLIC_SUPABASE_URL: ')
    const supabaseAnonKey = await question('NEXT_PUBLIC_SUPABASE_ANON_KEY: ')
    const supabaseServiceKey = await questionHidden('SUPABASE_SERVICE_ROLE_KEY (隐藏输入): ')

    // 收集应用 URL
    log('\n🌐 应用配置:', 'cyan')
    const appUrl = await question('SHOPIFY_APP_URL (例: https://your-app.vercel.app): ')

    rl.close()

    // 验证输入
    if (!shopifyApiKey || !shopifyApiSecret || !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !appUrl) {
      log('❌ 缺少必要的配置信息', 'red')
      process.exit(1)
    }

    // 生成安全密钥
    log('\n🔐 生成安全密钥...', 'blue')
    const secrets = generateSecrets()
    Object.entries(secrets).forEach(([key, value]) => {
      log(`  ✅ ${key}: ${value.substring(0, 16)}...`, 'green')
    })

    // 配置环境变量
    log('\n📝 配置环境变量...', 'blue')

    const envVars = {
      // Shopify 配置
      SHOPIFY_API_KEY: shopifyApiKey,
      SHOPIFY_API_SECRET: shopifyApiSecret,
      SHOPIFY_SCOPES: 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory',
      SHOPIFY_APP_URL: appUrl,
      
      // Supabase 配置
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey,
      
      // 应用配置
      NEXT_PUBLIC_APP_URL: appUrl,
      NODE_ENV: 'production',
      
      // 生成的密钥
      ...secrets
    }

    for (const [key, value] of Object.entries(envVars)) {
      await addEnvVar(key, value)
    }

    // 部署应用
    log('\n🚀 部署应用到 Vercel...', 'blue')
    execSync('vercel --prod', { stdio: 'inherit' })

    log('\n🎉 部署完成!', 'green')
    log('\n📋 下一步操作:', 'blue')
    log(`1. 测试健康检查: curl ${appUrl}/api/health`, 'yellow')
    log('2. 在 Shopify Partner Dashboard 中创建应用', 'yellow')
    log(`3. 设置 App URL 为: ${appUrl}`, 'yellow')
    log(`4. 设置回调 URL 为: ${appUrl}/api/auth/callback`, 'yellow')
    log('\n📚 详细文档: docs/deployment-guide.md', 'cyan')

  } catch (error) {
    log(`❌ 部署失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }
