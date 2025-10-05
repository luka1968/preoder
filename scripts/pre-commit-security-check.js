#!/usr/bin/env node

/**
 * GitHub 上传前安全检查脚本
 * 确保敏感信息不会被意外提交到代码仓库
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 敏感信息模式列表
const SENSITIVE_PATTERNS = [
  // Stripe keys
  /sk_live_[a-zA-Z0-9]+/g,
  /pk_live_[a-zA-Z0-9]+/g,
  /sk_test_[a-zA-Z0-9]+/g,
  /pk_test_[a-zA-Z0-9]+/g,
  
  // Brevo/Sendinblue keys
  /xkeysib-[a-zA-Z0-9\-]{50,}/g,
  
  // JWT tokens (长度检查，避免误报)
  /eyJ[a-zA-Z0-9\-_]{100,}/g,
  
  // Supabase URLs和keys
  /https:\/\/[a-z0-9]{20}\.supabase\.co/g,
  /sb-[a-z0-9]{20}-[a-zA-Z0-9]{40}/g,
  
  // Shopify keys (32字符十六进制)
  /[a-f0-9]{32}(?![a-f0-9])/g,
  
  // 通用API密钥模式
  /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
  /secret[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
  /access[_-]?token["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/gi,
  
  // 邮箱地址（在示例文件中可能是真实的）
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?=.*example|.*\.example)/g,
  
  // 密码模式
  /password["\s]*[:=]["\s]*[^"\s]{8,}/gi,
  /passwd["\s]*[:=]["\s]*[^"\s]{8,}/gi,
  
  // 数据库连接字符串
  /mongodb:\/\/[^\s"']+/g,
  /postgres:\/\/[^\s"']+/g,
  /mysql:\/\/[^\s"']+/g,
];

// 需要检查的文件扩展名
const CHECK_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.toml', '.env'];

// 排除的目录
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'build', 'dist', '.vercel'];

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item)) {
      getAllFiles(fullPath, files);
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (CHECK_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function checkFileForSensitiveData(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    for (const pattern of SENSITIVE_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          file: filePath,
          pattern: pattern.toString(),
          matches: matches.length
        });
      }
    }
    
    return violations;
  } catch (error) {
    console.warn(`⚠️  无法读取文件: ${filePath}`);
    return [];
  }
}

function main() {
  console.log('🔍 开始安全检查...\n');
  
  const projectRoot = process.cwd();
  const allFiles = getAllFiles(projectRoot);
  const allViolations = [];
  
  console.log(`📁 检查 ${allFiles.length} 个文件...\n`);
  
  for (const file of allFiles) {
    const violations = checkFileForSensitiveData(file);
    allViolations.push(...violations);
  }
  
  if (allViolations.length > 0) {
    console.log('❌ 发现敏感信息泄露！');
    console.log('=====================================\n');
    
    for (const violation of allViolations) {
      console.log(`🚨 文件: ${violation.file}`);
      console.log(`   模式: ${violation.pattern}`);
      console.log(`   匹配: ${violation.matches} 次\n`);
    }
    
    console.log('🛡️  请在上传到 GitHub 前移除这些敏感信息！');
    console.log('💡 建议操作：');
    console.log('   1. 将敏感信息移动到 .env.local 文件');
    console.log('   2. 使用环境变量替换硬编码的值');
    console.log('   3. 确保 .env.local 在 .gitignore 中');
    console.log('   4. 在 Vercel 中配置环境变量\n');
    
    process.exit(1);
  } else {
    console.log('✅ 安全检查通过！');
    console.log('🚀 代码可以安全上传到 GitHub');
    
    // 检查 .gitignore 配置
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      const requiredEntries = ['.env*.local', '.env', '.env.production', '.env.deploy'];
      const missingEntries = requiredEntries.filter(entry => !gitignoreContent.includes(entry));
      
      if (missingEntries.length > 0) {
        console.log('\n⚠️  .gitignore 可能缺少以下条目：');
        missingEntries.forEach(entry => console.log(`   - ${entry}`));
      } else {
        console.log('✅ .gitignore 配置正确');
      }
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFileForSensitiveData, SENSITIVE_PATTERNS };
