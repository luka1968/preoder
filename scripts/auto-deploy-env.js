#!/usr/bin/env node

/**
 * 自动化 Vercel 环境变量配置脚本
 * 使用 Vercel API 自动设置所有环境变量
 * 
 * 使用方法:
 * 1. 获取 Vercel Token: https://vercel.com/account/tokens
 * 2. 创建 .env.deploy 文件包含所有密钥
 * 3. 运行: node scripts/auto-deploy-env.js
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 生成安全密钥
function generateSecrets() {
  return {
    JWT_SECRET: crypto.randomBytes(32).toString('base64url'),
    CRON_SECRET: crypto.randomBytes(16).toString('hex'),
    SHOPIFY_WEBHOOK_SECRET: crypto.randomBytes(16).toString('hex'),
    ENCRYPTION_KEY: crypto.randomBytes(16).toString('hex'),
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex')
  }
}

// Vercel API 调用
function makeVercelRequest(path, method = 'GET', data = null, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result)
          } else {
            reject(new Error(`API Error: ${result.error?.message || body}`))
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${body}`))
        }
      })
    })

    req.on('error', reject)
    
    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

// 获取项目信息
async function getProject(projectName, token) {
  try {
    const projects = await makeVercelRequest('/v9/projects', 'GET', null, token)
    return projects.projects.find(p => p.name === projectName)
  } catch (error) {
    throw new Error(`获取项目失败: ${error.message}`)
  }
}

// 设置环境变量
async function setEnvironmentVariable(projectId, key, value, target, token) {
  const data = {
    key: key,
    value: value,
    target: [target],
    type: 'encrypted'
  }

  try {
    await makeVercelRequest(`/v10/projects/${projectId}/env`, 'POST', data, token)
    return true
  } catch (error) {
    // 如果变量已存在，尝试更新
    if (error.message.includes('already exists')) {
      log(`  ⚠️  ${key} 已存在，尝试更新...`, 'yellow')
      return await updateEnvironmentVariable(projectId, key, value, target, token)
    }
    throw error
  }
}

// 更新环境变量
async function updateEnvironmentVariable(projectId, key, value, target, token) {
  try {
    // 先获取现有的环境变量
    const envVars = await makeVercelRequest(`/v9/projects/${projectId}/env`, 'GET', null, token)
    const existingVar = envVars.envs.find(env => env.key === key && env.target.includes(target))
    
    if (existingVar) {
      // 更新现有变量
      const data = { value: value }
      await makeVercelRequest(`/v9/projects/${projectId}/env/${existingVar.id}`, 'PATCH', data, token)
      return true
    } else {
      // 创建新变量
      return await setEnvironmentVariable(projectId, key, value, target, token)
    }
  } catch (error) {
    throw new Error(`更新 ${key} 失败: ${error.message}`)
  }
}

// 主函数
async function main() {
  log('🚀 Vercel 环境变量自动配置工具', 'blue')
  log('================================\n', 'blue')

  // 检查配置文件
  const deployEnvPath = path.join(__dirname, '..', '.env.deploy')
  if (!fs.existsSync(deployEnvPath)) {
    log('❌ 未找到 .env.deploy 文件', 'red')
    log('请创建 .env.deploy 文件并包含以下内容:', 'yellow')
    log(`
# Vercel 配置
VERCEL_TOKEN=your_vercel_token_here
VERCEL_PROJECT_NAME=preorder-pro

# Shopify 配置 (从 Partner Dashboard 获取)
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret

# Supabase 配置 (从 Supabase Dashboard 获取)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 应用配置
SHOPIFY_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
`, 'yellow')
    process.exit(1)
  }

  // 读取配置
  const deployEnv = {}
  const envContent = fs.readFileSync(deployEnvPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value && !key.startsWith('#')) {
      deployEnv[key.trim()] = value.trim()
    }
  })

  const { VERCEL_TOKEN, VERCEL_PROJECT_NAME } = deployEnv

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_NAME) {
    log('❌ 缺少 VERCEL_TOKEN 或 VERCEL_PROJECT_NAME', 'red')
    process.exit(1)
  }

  try {
    // 获取项目
    log('🔍 查找 Vercel 项目...', 'blue')
    const project = await getProject(VERCEL_PROJECT_NAME, VERCEL_TOKEN)
    if (!project) {
      log(`❌ 未找到项目: ${VERCEL_PROJECT_NAME}`, 'red')
      process.exit(1)
    }
    log(`✅ 找到项目: ${project.name} (${project.id})`, 'green')

    // 生成安全密钥
    log('\n🔐 生成安全密钥...', 'blue')
    const secrets = generateSecrets()
    Object.entries(secrets).forEach(([key, value]) => {
      log(`  ✅ ${key}: ${value.substring(0, 16)}...`, 'green')
    })

    // 准备环境变量
    const envVars = {
      // Shopify 配置
      SHOPIFY_API_KEY: deployEnv.SHOPIFY_API_KEY,
      SHOPIFY_API_SECRET: deployEnv.SHOPIFY_API_SECRET,
      SHOPIFY_SCOPES: 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory',
      SHOPIFY_APP_URL: deployEnv.SHOPIFY_APP_URL,
      
      // Supabase 配置
      NEXT_PUBLIC_SUPABASE_URL: deployEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: deployEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: deployEnv.SUPABASE_SERVICE_ROLE_KEY,
      
      // 应用配置
      NEXT_PUBLIC_APP_URL: deployEnv.NEXT_PUBLIC_APP_URL,
      NODE_ENV: 'production',
      
      // 生成的密钥
      ...secrets
    }

    // 设置环境变量
    const environments = ['production', 'preview', 'development']
    
    for (const env of environments) {
      log(`\n📝 配置 ${env} 环境变量...`, 'blue')
      
      for (const [key, value] of Object.entries(envVars)) {
        if (!value) {
          log(`  ⚠️  跳过空值: ${key}`, 'yellow')
          continue
        }
        
        try {
          await setEnvironmentVariable(project.id, key, value, env, VERCEL_TOKEN)
          log(`  ✅ ${key}`, 'green')
        } catch (error) {
          log(`  ❌ ${key}: ${error.message}`, 'red')
        }
      }
    }

    log('\n🎉 环境变量配置完成!', 'green')
    log('\n📋 下一步操作:', 'blue')
    log('1. 重新部署应用: vercel --prod', 'yellow')
    log('2. 测试健康检查: curl https://your-app.vercel.app/api/health', 'yellow')
    log('3. 删除 .env.deploy 文件以确保安全', 'yellow')

  } catch (error) {
    log(`❌ 配置失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main, generateSecrets }
