#!/usr/bin/env node

/**
 * PreOrder Pro - 专业 App Extensions 部署脚本
 * 专业 Shopify 开发者使用的自动化部署工具
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PreOrder Pro 专业部署脚本启动...');
console.log('👨‍💻 专业 Shopify 开发者工具');

// 检查环境
function checkEnvironment() {
  console.log('\n📋 检查开发环境...');
  
  try {
    // 检查 Shopify CLI
    execSync('shopify version', { stdio: 'pipe' });
    console.log('✅ Shopify CLI 已安装');
  } catch (error) {
    console.log('❌ Shopify CLI 未安装');
    console.log('📦 请安装: npm install -g @shopify/cli @shopify/theme');
    process.exit(1);
  }

  // 检查项目结构
  const requiredFiles = [
    'shopify.app.toml',
    'extensions/preorder-embed/shopify.extension.toml',
    'extensions/preorder-embed/blocks'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ 缺少必要文件: ${file}`);
      process.exit(1);
    }
  }
  console.log('✅ 项目结构检查通过');
}

// 修复 Extension 配置
function fixExtensionConfig() {
  console.log('\n🔧 修复 App Extension 配置...');
  
  const extensionConfigPath = 'extensions/preorder-embed/shopify.extension.toml';
  const correctConfig = `# PreOrder Pro App Extension
name = "preorder-embed"
type = "theme_app_extension"

[[blocks]]
type = "app_embed"
name = "PreOrder Pro"
target = "head"

[settings]
name = "PreOrder Pro Embed"
`;

  fs.writeFileSync(extensionConfigPath, correctConfig);
  console.log('✅ Extension 配置已修复');
}

// 创建正确的 App Embed Block
function createAppEmbedBlock() {
  console.log('\n📝 创建专业 App Embed Block...');
  
  const blockPath = 'extensions/preorder-embed/blocks/app-embed.liquid';
  const blockContent = `{% comment %}
PreOrder Pro - Professional App Embed Block
Auto-injected into theme.liquid <head> section
{% endcomment %}

<!-- PreOrder Pro Configuration -->
<script>
  window.PREORDER_PRO_CONFIG = {
    shop: '{{ shop.permanent_domain }}',
    apiUrl: 'https://shopmall.dpdns.org/api',
    version: '2.0.0',
    mode: 'app_embed',
    enabled: {{ block.settings.enabled | default: true }},
    debug: {{ block.settings.debug | default: false }}
  };
  
  console.log('🚀 PreOrder Pro App Embed Block Loaded');
  console.log('📊 Config:', window.PREORDER_PRO_CONFIG);
</script>

<!-- Load PreOrder Pro Script -->
<script>
(function() {
  'use strict';
  
  if (window.PreOrderProEmbedLoaded) {
    console.log('✅ PreOrder Pro App Embed already loaded');
    return;
  }
  window.PreOrderProEmbedLoaded = true;
  
  // Load the professional preorder script
  const script = document.createElement('script');
  script.src = 'https://shopmall.dpdns.org/professional-preorder.js';
  script.async = true;
  script.onload = function() {
    console.log('✅ Professional PreOrder Script loaded via App Embed');
    
    // Initialize with App Embed configuration
    if (window.PreOrderPro && window.PreOrderPro.init) {
      window.PreOrderPro.init(window.PREORDER_PRO_CONFIG);
    }
    
    // Dispatch loaded event
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('preorder:app_embed_loaded', {
        detail: { 
          source: 'app_embed',
          config: window.PREORDER_PRO_CONFIG,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };
  script.onerror = function() {
    console.error('❌ Failed to load Professional PreOrder Script');
    
    // Fallback to instant fix script
    const fallbackScript = document.createElement('script');
    fallbackScript.src = 'https://shopmall.dpdns.org/instant-preorder-fix.js';
    document.head.appendChild(fallbackScript);
  };
  
  document.head.appendChild(script);
})();
</script>

<!-- Professional PreOrder Styles -->
<style>
/* PreOrder Pro - App Embed Styles */
.preorder-app-embed {
  /* Styles will be loaded by the main script */
}

/* Loading indicator for App Embed */
.preorder-loading {
  opacity: 0.7;
  pointer-events: none;
  transition: all 0.3s ease;
}
</style>

{% schema %}
{
  "name": "PreOrder Pro",
  "target": "head",
  "settings": [
    {
      "type": "checkbox",
      "id": "enabled",
      "label": "启用预购功能",
      "default": true,
      "info": "开启或关闭预购功能"
    },
    {
      "type": "text",
      "id": "api_url",
      "label": "API URL",
      "default": "https://shopmall.dpdns.org/api",
      "info": "PreOrder Pro API 地址"
    },
    {
      "type": "checkbox",
      "id": "debug",
      "label": "调试模式",
      "default": false,
      "info": "开启调试模式显示详细日志"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "预购按钮文本",
      "default": "立即预订 Pre-Order Now",
      "info": "自定义预购按钮显示文本"
    },
    {
      "type": "color",
      "id": "button_color",
      "label": "按钮颜色",
      "default": "#ff6b35",
      "info": "预购按钮主色调"
    }
  ]
}
{% endschema %}`;

  fs.writeFileSync(blockPath, blockContent);
  console.log('✅ 专业 App Embed Block 已创建');
}

// 部署 Extensions
function deployExtensions() {
  console.log('\n🚀 部署 App Extensions...');
  
  try {
    // 检查登录状态
    console.log('🔐 检查 Shopify CLI 登录状态...');
    execSync('shopify auth whoami', { stdio: 'pipe' });
    console.log('✅ 已登录 Shopify CLI');
  } catch (error) {
    console.log('❌ 未登录 Shopify CLI');
    console.log('🔑 正在启动登录流程...');
    execSync('shopify auth login', { stdio: 'inherit' });
  }

  try {
    console.log('📦 开始部署 App Extensions...');
    execSync('shopify app deploy', { stdio: 'inherit' });
    console.log('✅ App Extensions 部署成功');
  } catch (error) {
    console.log('❌ App Extensions 部署失败');
    console.log('💡 可能的解决方案:');
    console.log('   1. 检查网络连接');
    console.log('   2. 确认应用权限');
    console.log('   3. 重新登录 Shopify CLI');
    throw error;
  }
}

// 验证部署
function verifyDeployment() {
  console.log('\n✅ 验证部署结果...');
  
  console.log('📋 部署完成后的操作步骤:');
  console.log('   1. 进入 Shopify Admin');
  console.log('   2. Online Store → Themes → Customize');
  console.log('   3. 在左侧菜单找到 "App embeds"');
  console.log('   4. 启用 "PreOrder Pro"');
  console.log('   5. 配置预购设置');
  console.log('   6. 保存并发布');
  
  console.log('\n🧪 测试步骤:');
  console.log('   1. 访问售罄产品页面');
  console.log('   2. 确认预购按钮显示');
  console.log('   3. 测试按钮功能');
  console.log('   4. 检查浏览器控制台日志');
}

// 主执行函数
async function main() {
  try {
    checkEnvironment();
    fixExtensionConfig();
    createAppEmbedBlock();
    deployExtensions();
    verifyDeployment();
    
    console.log('\n🎉 专业部署完成!');
    console.log('📱 App Embed Block 已成功部署到你的应用');
    console.log('⚙️  请在 Shopify 主题编辑器中启用 "PreOrder Pro"');
    
  } catch (error) {
    console.error('\n❌ 部署失败:', error.message);
    console.log('\n🔧 故障排除:');
    console.log('   1. 确保 Shopify CLI 已正确安装');
    console.log('   2. 检查网络连接');
    console.log('   3. 确认应用权限和配置');
    console.log('   4. 联系技术支持');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  fixExtensionConfig,
  createAppEmbedBlock,
  deployExtensions,
  verifyDeployment
};
