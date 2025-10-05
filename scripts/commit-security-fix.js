#!/usr/bin/env node

/**
 * 安全修复提交脚本
 * 自动提交API密钥泄露修复
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description}完成`);
    return result;
  } catch (error) {
    console.error(`❌ ${description}失败:`, error.message);
    throw error;
  }
}

function main() {
  console.log('🔐 开始提交安全修复...');
  console.log('========================');
  console.log('');
  
  try {
    // 检查git状态
    console.log('📋 检查当前状态...');
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ 没有需要提交的更改');
      return;
    }
    
    console.log('📝 发现以下更改:');
    console.log(status);
    console.log('');
    
    // 添加修改的文件
    runCommand('git add .env.production.example', '添加修复的配置文件');
    runCommand('git add SECURITY_INCIDENT_RESPONSE.md', '添加安全事件响应文档');
    runCommand('git add scripts/rotate-api-keys.js', '添加密钥轮换脚本');
    runCommand('git add scripts/pre-commit-security-check.js', '添加增强的安全检查脚本');
    runCommand('git add scripts/commit-security-fix.js', '添加提交脚本');
    
    // 创建提交
    const commitMessage = `🔒 Security: Fix API key exposure in configuration files

- Replace real API keys with placeholders in .env.production.example
- Remove exposed Shopify, Supabase, and Brevo credentials
- Add security incident response documentation
- Create API key rotation helper script
- Enhance pre-commit security checks

Fixes: API key exposure detected by Brevo security scanning
Impact: Prevents future accidental credential commits
Action Required: Rotate all exposed API keys in production`;

    runCommand(`git commit -m "${commitMessage}"`, '创建安全修复提交');
    
    console.log('');
    console.log('✅ 安全修复已提交！');
    console.log('');
    console.log('🚀 下一步操作：');
    console.log('1. 推送到远程仓库: git push');
    console.log('2. 运行密钥轮换脚本: node scripts/rotate-api-keys.js');
    console.log('3. 更新生产环境变量');
    console.log('4. 测试应用功能');
    console.log('');
    console.log('📖 详细指导请查看: SECURITY_INCIDENT_RESPONSE.md');
    
  } catch (error) {
    console.error('❌ 提交失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
