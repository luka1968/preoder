#!/usr/bin/env node

/**
 * API密钥轮换助手脚本
 * 帮助生成新的密钥并提供轮换指导
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 生成安全的随机字符串
function generateSecureKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// 生成JWT密钥
function generateJWTSecret(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 主要功能
async function main() {
  console.log('🔐 API密钥轮换助手');
  console.log('==================');
  console.log('');
  
  console.log('⚠️  重要提醒：');
  console.log('1. 请先备份当前的生产环境配置');
  console.log('2. 在非高峰时段进行密钥轮换');
  console.log('3. 轮换后立即测试所有功能');
  console.log('');
  
  // 生成新密钥
  console.log('🔑 生成新的密钥：');
  console.log('');
  
  const newJWTSecret = generateJWTSecret(64);
  const newCronSecret = generateSecureKey(32);
  
  console.log(`JWT_SECRET=${newJWTSecret}`);
  console.log(`CRON_SECRET=${newCronSecret}`);
  console.log('');
  
  console.log('📋 需要手动轮换的API密钥：');
  console.log('');
  console.log('1. Brevo API密钥：');
  console.log('   - 访问: https://app.brevo.com/');
  console.log('   - 路径: SMTP & API > API Keys');
  console.log('   - 操作: 删除旧密钥，生成新密钥');
  console.log('');
  
  console.log('2. Shopify API密钥：');
  console.log('   - 访问: https://partners.shopify.com/');
  console.log('   - 路径: 你的应用 > App setup');
  console.log('   - 操作: 重新生成API密钥和密钥');
  console.log('');
  
  console.log('3. Supabase密钥：');
  console.log('   - 访问: https://app.supabase.com/');
  console.log('   - 路径: 项目设置 > API');
  console.log('   - 操作: 重新生成service_role密钥');
  console.log('');
  
  console.log('🚀 更新生产环境变量：');
  console.log('');
  console.log('Vercel CLI命令：');
  console.log('vercel env add JWT_SECRET');
  console.log('vercel env add CRON_SECRET');
  console.log('vercel env add BREVO_API_KEY');
  console.log('vercel env add SHOPIFY_API_KEY');
  console.log('vercel env add SHOPIFY_API_SECRET');
  console.log('vercel env add SUPABASE_SERVICE_ROLE_KEY');
  console.log('');
  
  console.log('或访问 Vercel Dashboard:');
  console.log('https://vercel.com/dashboard > 项目 > Settings > Environment Variables');
  console.log('');
  
  // 询问是否继续
  const answer = await new Promise((resolve) => {
    rl.question('是否已完成所有密钥轮换？(y/N): ', resolve);
  });
  
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('');
    console.log('✅ 密钥轮换完成！');
    console.log('');
    console.log('🧪 请执行以下测试：');
    console.log('1. npm run build');
    console.log('2. 测试邮件发送功能');
    console.log('3. 测试Shopify API连接');
    console.log('4. 检查应用日志');
    console.log('');
    console.log('📝 记录本次轮换：');
    console.log(`- 轮换时间: ${new Date().toISOString()}`);
    console.log('- 轮换原因: API密钥泄露事件');
    console.log('- 影响范围: 所有API服务');
  } else {
    console.log('');
    console.log('⏳ 请完成密钥轮换后重新运行此脚本');
  }
  
  rl.close();
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('❌ 脚本执行出错:', error);
  process.exit(1);
});

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateSecureKey,
  generateJWTSecret
};
